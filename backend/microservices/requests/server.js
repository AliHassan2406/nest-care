import express from 'express';
import { isDatabaseReady, readCollection, writeCollection } from '../shared/storage.js';
import { requireAuth, requireRole } from '../shared/security.js';
import { sendNotification } from '../shared/notify.js';
import { PORTS } from '../shared/ports.js';

const app = express();
app.use(express.json({ limit: '1mb' }));

function pushHistory(request, status, actor) {
  if (!Array.isArray(request.statusHistory)) request.statusHistory = [];
  request.statusHistory.push({ status, at: new Date().toISOString(), by: actor || 'system' });
}

function canTransition(from, to) {
  const transitions = {
    'Pending': ['In Progress'],
    'In Progress': ['Completed', 'Pending'],
    'Completed': [],
  };
  return from === to || (transitions[from] || []).includes(to);
}

app.get('/health', (_req, res) => {
  const database = isDatabaseReady();
  return res.status(database ? 200 : 503).json({ ok: database, service: 'requests-service', database: { ok: database } });
});

app.get('/api/requests', requireAuth, (req, res) => {
  const all = readCollection('requests.json', []);
  const user = req.user;
  let requests;
  if (user.role === 'Admin') {
    requests = all;
  } else if (user.role === 'Worker') {
    requests = all.filter((item) =>
      item.assignedWorkerId === user.id || (!item.assignedWorkerId && item.type === user.specialization)
    );
  } else {
    requests = all.filter((item) => item.userId === user.id);
  }

  const status = String(req.query.status || '').trim();
  const type = String(req.query.type || '').trim();
  const search = String(req.query.search || '').trim().toLowerCase();
  if (status) requests = requests.filter((item) => item.status === status);
  if (type) requests = requests.filter((item) => item.type === type);
  if (search) requests = requests.filter((item) => [item.id, item.name, item.location, item.description, item.type].some((value) => String(value || '').toLowerCase().includes(search)));
  requests = [...requests].sort((a, b) => String(b.createdAt || b.date || '').localeCompare(String(a.createdAt || a.date || '')));
  return res.json({ requests });
});

app.post('/api/requests', requireAuth, requireRole(['User']), async (req, res) => {
  const body = req.body || {};
  const type = String(body.type || '').trim();
  const location = String(body.location || '').trim();
  const description = String(body.description || '').trim();
  if (!type || !location || !description) {
    return res.status(400).json({ message: 'Choose a service, add a location and describe the issue.' });
  }
  if (description.length > 2000) return res.status(400).json({ message: 'Description must be 2,000 characters or less.' });
  const validPriorities = ['Standard', 'Urgent'];
  const priority = validPriorities.includes(body.priority) ? body.priority : 'Standard';

  const requests = readCollection('requests.json', []);
  const request = {
    id: `REQ${Date.now()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`,
    userId: req.user.id,
    name: req.user.name,
    email: req.user.email,
    phone: req.user.phone,
    type,
    location,
    description,
    priority,
    appointmentDate: body.appointmentDate || '',
    preferredTime: body.preferredTime || '',
    status: 'Pending',
    date: new Date().toISOString().slice(0, 10),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    statusHistory: [],
  };
  pushHistory(request, 'Pending', req.user.username);
  requests.push(request);
  writeCollection('requests.json', requests);

  await sendNotification({
    userId: req.user.id,
    title: 'Request received',
    message: `Your ${type.toLowerCase()} request ${request.id} has been submitted. We’ll keep you updated here.`,
    kind: 'request-created', requestId: request.id,
  });
  return res.status(201).json({ request });
});

app.patch('/api/requests/:id', requireAuth, async (req, res) => {
  const requests = readCollection('requests.json', []);
  const index = requests.findIndex((item) => item.id === req.params.id);
  if (index < 0) return res.status(404).json({ message: 'Request not found.' });
  const request = requests[index];
  const body = req.body || {};
  const isAdmin = req.user.role === 'Admin';
  const isMatchingWorker = req.user.role === 'Worker' &&
    (request.assignedWorkerId === req.user.id || (!request.assignedWorkerId && request.type === req.user.specialization));
  if (!isAdmin && !isMatchingWorker) return res.status(403).json({ message: 'You cannot update this request.' });

  if (body.status) {
    const next = String(body.status);
    if (!['Pending', 'In Progress', 'Completed'].includes(next)) return res.status(400).json({ message: 'Unknown request status.' });
    if (!canTransition(request.status, next)) {
      return res.status(409).json({ message: `This request cannot move from ${request.status} to ${next}.` });
    }
    const changed = request.status !== next;
    request.status = next;
    if (changed) {
      pushHistory(request, next, req.user.username);
      await sendNotification({
        userId: request.userId,
        title: `Request ${next.toLowerCase()}`,
        message: `Your request ${request.id} is now marked “${next}”.`,
        kind: 'status-update', requestId: request.id,
      });
    }
  }

  if (body.assignedWorkerId !== undefined) {
    if (!isAdmin) return res.status(403).json({ message: 'Only an administrator can assign a worker.' });
    const workerId = String(body.assignedWorkerId || '');
    if (workerId) {
      const worker = readCollection('users.json', []).find((item) => item.id === workerId && item.role === 'Worker');
      if (!worker) return res.status(400).json({ message: 'Select a valid worker.' });
      if (worker.specialization !== request.type && !(request.type === 'Other' && worker.specialization === 'Other')) {
        return res.status(400).json({ message: 'That worker does not match this service type.' });
      }
      request.assignedWorkerId = worker.id;
      request.assignedWorkerName = worker.name;
      await sendNotification({
        userId: worker.id,
        title: 'New job assigned',
        message: `Request ${request.id} has been assigned to you.`,
        kind: 'assignment', requestId: request.id,
      });
    } else {
      delete request.assignedWorkerId;
      delete request.assignedWorkerName;
    }
  }

  request.updatedAt = new Date().toISOString();
  requests[index] = request;
  writeCollection('requests.json', requests);
  return res.json({ request });
});

app.delete('/api/requests/:id', requireAuth, requireRole(['Admin']), (req, res) => {
  const requests = readCollection('requests.json', []);
  if (!requests.some((item) => item.id === req.params.id)) return res.status(404).json({ message: 'Request not found.' });
  writeCollection('requests.json', requests.filter((item) => item.id !== req.params.id));
  return res.status(204).end();
});

const port = Number(process.env.REQUESTS_SERVICE_PORT || PORTS.requests);
app.listen(port, '127.0.0.1', () => console.log(`[requests-service] listening on http://127.0.0.1:${port}`));
