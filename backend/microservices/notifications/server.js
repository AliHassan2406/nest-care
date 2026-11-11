import express from 'express';
import { isDatabaseReady, readCollection, writeCollection } from '../shared/storage.js';
import { requireAuth } from '../shared/security.js';
import { PORTS } from '../shared/ports.js';

const app = express();
app.use(express.json({ limit: '256kb' }));
const INTERNAL_KEY = 'home-services-local';

app.get('/health', (_req, res) => {
  const database = isDatabaseReady();
  return res.status(database ? 200 : 503).json({ ok: database, service: 'notifications-service', database: { ok: database } });
});
app.post('/internal/notifications', (req, res) => {
  if (req.headers['x-internal-service'] !== INTERNAL_KEY) return res.status(403).json({ message: 'Internal service access only.' });
  const { userId, title, message, kind, requestId } = req.body || {};
  if (!userId || !title || !message) return res.status(400).json({ message: 'userId, title and message are required.' });
  const notifications = readCollection('notifications.json', []);
  const notification = {
    id: `NTF${Date.now()}${Math.random().toString(36).slice(2, 5)}`,
    userId, title: String(title).slice(0, 120), message: String(message).slice(0, 500),
    kind: String(kind || 'general'), requestId: String(requestId || ''),
    read: false, createdAt: new Date().toISOString(),
  };
  notifications.unshift(notification);
  writeCollection('notifications.json', notifications.slice(0, 2000));
  return res.status(201).json({ notification });
});
app.get('/api/notifications', requireAuth, (req, res) => {
  const all = readCollection('notifications.json', []);
  const notifications = all.filter((item) => req.user.role === 'Admin' || item.userId === req.user.id).slice(0, 100);
  return res.json({ notifications, unreadCount: notifications.filter((item) => !item.read).length });
});
app.patch('/api/notifications/:id/read', requireAuth, (req, res) => {
  const notifications = readCollection('notifications.json', []);
  const item = notifications.find((entry) => entry.id === req.params.id);
  if (!item) return res.status(404).json({ message: 'Notification not found.' });
  if (req.user.role !== 'Admin' && item.userId !== req.user.id) return res.status(403).json({ message: 'You cannot update this notification.' });
  item.read = true;
  item.readAt = new Date().toISOString();
  writeCollection('notifications.json', notifications);
  return res.json({ notification: item });
});
app.patch('/api/notifications/read-all', requireAuth, (req, res) => {
  const notifications = readCollection('notifications.json', []);
  const now = new Date().toISOString();
  for (const item of notifications) {
    if ((req.user.role === 'Admin' || item.userId === req.user.id) && !item.read) {
      item.read = true;
      item.readAt = now;
    }
  }
  writeCollection('notifications.json', notifications);
  return res.json({ ok: true });
});

const port = Number(process.env.NOTIFICATIONS_SERVICE_PORT || PORTS.notifications);
app.listen(port, '127.0.0.1', () => console.log(`[notifications-service] listening on http://127.0.0.1:${port}`));
