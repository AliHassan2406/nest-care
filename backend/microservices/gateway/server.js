import express from 'express';
import cors from 'cors';
import { PORTS } from '../shared/ports.js';

const app = express();
app.disable('x-powered-by');
const configuredOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',').map((origin) => origin.trim()).filter(Boolean);
app.use(cors({
  origin(origin, callback) {
    const isLocalDevelopmentOrigin = /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin || '');
    if (!origin || configuredOrigins.includes(origin) || isLocalDevelopmentOrigin) return callback(null, true);
    return callback(new Error('This origin is not allowed by the local API gateway.'), false);
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '1mb' }));

const services = {
  auth: process.env.AUTH_SERVICE_URL || `http://127.0.0.1:${PORTS.auth}`,
  requests: process.env.REQUESTS_SERVICE_URL || `http://127.0.0.1:${PORTS.requests}`,
  catalog: process.env.CATALOG_SERVICE_URL || `http://127.0.0.1:${PORTS.catalog}`,
  notifications: process.env.NOTIFICATIONS_SERVICE_URL || `http://127.0.0.1:${PORTS.notifications}`,
};

function proxyTo(serviceUrl, label) {
  return async (req, res) => {
    try {
      const upstreamUrl = new URL(req.originalUrl, serviceUrl);
      const headers = {};
      if (req.headers.authorization) headers.authorization = req.headers.authorization;
      if (req.headers['content-type']) headers['content-type'] = req.headers['content-type'];
      const hasBody = !['GET', 'HEAD'].includes(req.method) && req.body !== undefined;
      const response = await fetch(upstreamUrl, {
        method: req.method,
        headers,
        body: hasBody ? JSON.stringify(req.body) : undefined,
        signal: AbortSignal.timeout(10000),
      });
      res.status(response.status);
      const contentType = response.headers.get('content-type');
      if (contentType) res.setHeader('content-type', contentType);
      if (response.status === 204 || req.method === 'HEAD') return res.end();
      const payload = Buffer.from(await response.arrayBuffer());
      return res.send(payload);
    } catch (error) {
      console.error(`[gateway] ${label} proxy error:`, error.message);
      return res.status(502).json({
        message: `${label} service is not responding. Make sure all services are running.`,
        service: label,
      });
    }
  };
}

app.get('/health', (_req, res) => res.json({ ok: true, service: 'api-gateway' }));
app.get('/api/health', async (_req, res) => {
  const entries = await Promise.all(Object.entries(services).map(async ([name, base]) => {
    try {
      const response = await fetch(`${base}/health`, { signal: AbortSignal.timeout(1200) });
      const data = await response.json();
      const databaseOk = data.database?.ok === true;
      return [name, {
        ok: response.ok && data.ok === true && databaseOk,
        service: data.service || name,
        database: { ok: databaseOk },
      }];
    } catch {
      return [name, { ok: false }];
    }
  }));
  const serviceHealth = Object.fromEntries(entries);
  const ok = Object.values(serviceHealth).every((service) => service.ok);
  return res.status(ok ? 200 : 503).json({ ok, service: 'api-gateway', services: serviceHealth });
});

app.use('/api/auth', proxyTo(services.auth, 'authentication'));
app.use('/api/users', proxyTo(services.auth, 'users'));
app.use('/api/workers', proxyTo(services.auth, 'workers'));
app.use('/api/requests', proxyTo(services.requests, 'requests'));
app.use('/api/services', proxyTo(services.catalog, 'catalog'));
app.use('/api/notifications', proxyTo(services.notifications, 'notifications'));

app.use((_req, res) => res.status(404).json({ message: 'API route not found.' }));
app.use((error, _req, res, _next) => {
  console.error('[gateway] request error:', error.message);
  res.status(500).json({ message: 'Unexpected API gateway error.' });
});

app.listen(PORTS.gateway, '127.0.0.1', () => {
  console.log(`[api-gateway] listening on http://127.0.0.1:${PORTS.gateway}`);
  console.log('[api-gateway] routes: auth, users, workers, requests, services, notifications');
});
