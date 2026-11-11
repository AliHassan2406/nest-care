import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const services = [
  ['auth-service', path.join(here, 'microservices/auth/server.js')],
  ['requests-service', path.join(here, 'microservices/requests/server.js')],
  ['catalog-service', path.join(here, 'microservices/catalog/server.js')],
  ['notifications-service', path.join(here, 'microservices/notifications/server.js')],
  ['api-gateway', path.join(here, 'microservices/gateway/server.js')],
];

const children = [];
for (const [name, entry] of services) {
  const child = spawn(process.execPath, [entry], { cwd: root, stdio: 'inherit', env: process.env });
  children.push({ name, child });
  child.on('error', (error) => console.error(`[${name}] could not start: ${error.message}`));
  child.on('exit', (code, signal) => {
    if (code !== 0 && code !== null) console.error(`[${name}] exited with code ${code}`);
    if (signal && signal !== 'SIGINT' && signal !== 'SIGTERM') console.error(`[${name}] exited due to ${signal}`);
  });
}

function shutdown(signal) {
  console.log(`\n[dev-services] stopping services (${signal})...`);
  for (const { child } of children) if (!child.killed) child.kill(signal);
  setTimeout(() => process.exit(0), 250).unref();
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
console.log('\nHome Services local microservices');
console.log('Gateway:       http://localhost:4000');
console.log('Health check:  http://localhost:4000/api/health');
console.log('Keep this terminal open while using the app.\n');
