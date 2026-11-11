import express from 'express';
import bcrypt from 'bcryptjs';
import { isDatabaseReady, readCollection, writeCollection } from '../shared/storage.js';
import { publicUser, signToken, requireAuth, requireRole } from '../shared/security.js';
import { PORTS } from '../shared/ports.js';

const app = express();
app.use(express.json({ limit: '1mb' }));

const seedUsers = [
  { id: 'admin1', username: 'admin', password: 'admin123', role: 'Admin', name: 'Admin User', email: 'admin@repair.com', phone: '923000000001' },
  { id: 'worker1', username: 'worker', password: 'worker123', role: 'Worker', name: 'Ahmed — Electrician', email: 'worker@repair.com', phone: '923100000001', specialization: 'Electrical', experience: '5 years', rating: 4.8 },
  { id: 'worker2', username: 'plumber', password: 'worker123', role: 'Worker', name: 'Ali — Plumber', email: 'plumber@repair.com', phone: '923200000002', specialization: 'Plumbing', experience: '7 years', rating: 4.9 },
  { id: 'worker3', username: 'carpenter', password: 'worker123', role: 'Worker', name: 'Hassan — Carpenter', email: 'carpenter@repair.com', phone: '923300000003', specialization: 'Furniture', experience: '6 years', rating: 4.7 },
  { id: 'worker4', username: 'cleaner', password: 'worker123', role: 'Worker', name: 'Sara — Home Cleaning', email: 'cleaner@repair.com', phone: '923400000005', specialization: 'Cleaning', experience: '4 years', rating: 4.9 },
  { id: 'worker5', username: 'handyman', password: 'worker123', role: 'Worker', name: 'Usman — General Maintenance', email: 'handyman@repair.com', phone: '923500000006', specialization: 'Other', experience: '6 years', rating: 4.8 },
  { id: 'user1', username: 'user', password: 'user123', role: 'User', name: 'John Doe', email: 'user@repair.com', phone: '923400000004' },
];

function ensureSeedUsers() {
  const storedUsers = readCollection('users.json', []);
  const users = Array.isArray(storedUsers) ? storedUsers : [];
  let changed = !Array.isArray(storedUsers);
  for (const seed of seedUsers) {
    if (users.some((user) => String(user.username).toLowerCase() === seed.username.toLowerCase())) continue;
    const { password, ...safeFields } = seed;
    users.push({ ...safeFields, passwordHash: bcrypt.hashSync(password, 10) });
    changed = true;
  }
  if (changed || !Array.isArray(users)) writeCollection('users.json', users);
}
ensureSeedUsers();

const authRouter = express.Router();
authRouter.post('/register', (req, res) => {
  const name = String(req.body?.name || '').trim();
  const email = String(req.body?.email || '').trim().toLowerCase();
  const phone = String(req.body?.phone || '').trim();
  const username = String(req.body?.username || '').trim();
  const password = String(req.body?.password || '');

  if (!name || !email || !phone || !username || !password) {
    return res.status(400).json({ message: 'Please complete all required fields.' });
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ message: 'Please enter a valid email address.' });
  if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters long.' });

  const users = readCollection('users.json', []);
  if (users.some((user) => String(user.username).toLowerCase() === username.toLowerCase())) {
    return res.status(409).json({ message: 'That username is already taken. Please choose another.' });
  }
  if (users.some((user) => String(user.email).toLowerCase() === email)) {
    return res.status(409).json({ message: 'An account already uses this email address.' });
  }

  const user = {
    id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    role: 'User', name, email, phone, username,
    passwordHash: bcrypt.hashSync(password, 10),
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  writeCollection('users.json', users);
  return res.status(201).json({ user: publicUser(user), message: 'Account created. You can sign in now.' });
});

authRouter.post('/login', (req, res) => {
  const username = String(req.body?.username || '').trim();
  const password = String(req.body?.password || '');
  if (!username || !password) return res.status(400).json({ message: 'Enter your username and password.' });

  const user = readCollection('users.json', []).find((item) => String(item.username).toLowerCase() === username.toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.passwordHash || '')) {
    return res.status(401).json({ message: 'Invalid username or password.' });
  }
  return res.json({ token: signToken(user), user: publicUser(user) });
});

authRouter.get('/me', requireAuth, (req, res) => res.json({ user: req.user }));

const usersRouter = express.Router();
usersRouter.get('/', requireAuth, requireRole(['Admin']), (_req, res) => {
  const users = readCollection('users.json', []).map(publicUser);
  return res.json({ users });
});
usersRouter.post('/', requireAuth, requireRole(['Admin']), (req, res) => {
  const data = req.body || {};
  const username = String(data.username || '').trim();
  const password = String(data.password || '');
  const name = String(data.name || '').trim();
  const email = String(data.email || '').trim().toLowerCase();
  const phone = String(data.phone || '').trim();
  const role = data.role === 'Worker' ? 'Worker' : 'User';
  if (!username || !password || !name || !email || !phone) {
    return res.status(400).json({ message: 'Username, password, name, email and phone are required.' });
  }
  if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
  const users = readCollection('users.json', []);
  if (users.some((item) => String(item.username).toLowerCase() === username.toLowerCase())) {
    return res.status(409).json({ message: 'Username already exists.' });
  }
  if (users.some((item) => String(item.email).toLowerCase() === email)) {
    return res.status(409).json({ message: 'Email already exists.' });
  }
  const worker = {
    id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    username, role, name, email, phone,
    passwordHash: bcrypt.hashSync(password, 10),
    ...(role === 'Worker' ? {
      specialization: String(data.specialization || 'Other'),
      experience: String(data.experience || 'New professional'),
      rating: Number.isFinite(Number(data.rating)) ? Number(data.rating) : 4.5,
    } : {}),
    createdAt: new Date().toISOString(),
  };
  users.push(worker);
  writeCollection('users.json', users);
  return res.status(201).json({ user: publicUser(worker) });
});
usersRouter.patch('/:id', requireAuth, requireRole(['Admin']), (req, res) => {
  const users = readCollection('users.json', []);
  const index = users.findIndex((item) => item.id === req.params.id);
  if (index < 0) return res.status(404).json({ message: 'User not found.' });
  const allowed = ['name', 'email', 'phone', 'specialization', 'experience', 'rating', 'role'];
  const updates = {};
  for (const key of allowed) if (req.body?.[key] !== undefined) updates[key] = req.body[key];
  if (req.body?.password) {
    if (String(req.body.password).length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
    updates.passwordHash = bcrypt.hashSync(String(req.body.password), 10);
  }
  if (updates.email) updates.email = String(updates.email).trim().toLowerCase();
  if (updates.role && !['Admin', 'Worker', 'User'].includes(updates.role)) delete updates.role;
  users[index] = { ...users[index], ...updates, updatedAt: new Date().toISOString() };
  writeCollection('users.json', users);
  return res.json({ user: publicUser(users[index]) });
});
usersRouter.delete('/:id', requireAuth, requireRole(['Admin']), (req, res) => {
  if (req.params.id === req.user.id) return res.status(400).json({ message: 'You cannot delete your own account while signed in.' });
  const users = readCollection('users.json', []);
  const target = users.find((item) => item.id === req.params.id);
  if (!target) return res.status(404).json({ message: 'User not found.' });
  if (target.role === 'Admin' && users.filter((item) => item.role === 'Admin').length <= 1) {
    return res.status(400).json({ message: 'The last administrator cannot be removed.' });
  }
  writeCollection('users.json', users.filter((item) => item.id !== req.params.id));
  return res.status(204).end();
});

const workersRouter = express.Router();
workersRouter.get('/', requireAuth, (_req, res) => {
  const workers = readCollection('users.json', [])
    .filter((user) => user.role === 'Worker' && user.isActive !== false)
    .map((user) => publicUser(user));
  return res.json({ workers });
});

app.get('/health', (_req, res) => {
  const database = isDatabaseReady();
  return res.status(database ? 200 : 503).json({ ok: database, service: 'auth-service', database: { ok: database } });
});
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/workers', workersRouter);
const port = Number(process.env.AUTH_SERVICE_PORT || PORTS.auth);
app.listen(port, '127.0.0.1', () => console.log(`[auth-service] listening on http://127.0.0.1:${port}`));
