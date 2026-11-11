import express from 'express';
import { isDatabaseReady, readCollection, writeCollection } from '../shared/storage.js';
import { requireAuth, requireRole } from '../shared/security.js';
import { PORTS } from '../shared/ports.js';

const app = express();
app.use(express.json({ limit: '256kb' }));

const initialServices = [
  { id: 'svc-electrical', name: 'Electrical', title: 'Electrical repairs', description: 'Safe fixes for wiring, switches, lights and power issues.', icon: '⚡', type: 'Electrical', accent: 'amber', startingPrice: 'Quote on request' },
  { id: 'svc-plumbing', name: 'Plumbing', title: 'Plumbing & leaks', description: 'Tap repairs, blocked drains, leaks and water fittings.', icon: '🚿', type: 'Plumbing', accent: 'sky', startingPrice: 'Quote on request' },
  { id: 'svc-furniture', name: 'Furniture', title: 'Furniture repairs', description: 'Cabinet fixes, hinges, doors and everyday woodwork.', icon: '🪑', type: 'Furniture', accent: 'orange', startingPrice: 'Quote on request' },
  { id: 'svc-cleaning', name: 'Cleaning', title: 'Home cleaning', description: 'Thoughtful room-by-room and deep-cleaning help.', icon: '✨', type: 'Cleaning', accent: 'emerald', startingPrice: 'Quote on request' },
  { id: 'svc-other', name: 'Maintenance', title: 'General maintenance', description: 'The odd jobs and home fixes that need a steady hand.', icon: '🧰', type: 'Other', accent: 'violet', startingPrice: 'Ask for a quote' },
];
function ensureCatalog() {
  const existing = readCollection('services.json', []);
  if (existing.length) return;
  writeCollection('services.json', initialServices);
}
ensureCatalog();

app.get('/health', (_req, res) => {
  const database = isDatabaseReady();
  return res.status(database ? 200 : 503).json({ ok: database, service: 'catalog-service', database: { ok: database } });
});
app.get('/api/services', (_req, res) => res.json({ services: readCollection('services.json', initialServices) }));
app.post('/api/services', requireAuth, requireRole(['Admin']), (req, res) => {
  const name = String(req.body?.name || '').trim();
  const type = String(req.body?.type || '').trim();
  const description = String(req.body?.description || '').trim();
  if (!name || !type || !description) return res.status(400).json({ message: 'Name, type and description are required.' });
  const services = readCollection('services.json', initialServices);
  const service = {
    id: `svc_${Date.now()}`, name, type, description,
    icon: String(req.body?.icon || '🧰'), accent: String(req.body?.accent || 'sky'),
    startingPrice: String(req.body?.startingPrice || 'Ask for a quote'),
  };
  services.push(service);
  writeCollection('services.json', services);
  return res.status(201).json({ service });
});
app.delete('/api/services/:id', requireAuth, requireRole(['Admin']), (req, res) => {
  const services = readCollection('services.json', initialServices);
  if (!services.some((service) => service.id === req.params.id)) return res.status(404).json({ message: 'Service not found.' });
  writeCollection('services.json', services.filter((service) => service.id !== req.params.id));
  return res.status(204).end();
});

const port = Number(process.env.CATALOG_SERVICE_PORT || PORTS.catalog);
app.listen(port, '127.0.0.1', () => console.log(`[catalog-service] listening on http://127.0.0.1:${port}`));
