import './env.js';

export const PORTS = {
  gateway: Number(process.env.PORT || 4000),
  auth: Number(process.env.AUTH_SERVICE_PORT || 4001),
  requests: Number(process.env.REQUESTS_SERVICE_PORT || 4002),
  catalog: Number(process.env.CATALOG_SERVICE_PORT || 4003),
  notifications: Number(process.env.NOTIFICATIONS_SERVICE_PORT || 4004),
};
