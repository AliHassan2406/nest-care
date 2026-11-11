import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const children = [
  spawn(process.execPath, [path.join(root, 'backend/start-all.js')], { cwd: root, stdio: 'inherit', env: process.env }),
  spawn(process.execPath, [path.join(root, 'node_modules/vite/bin/vite.js')], { cwd: root, stdio: 'inherit', env: process.env }),
];
function stop() {
  for (const child of children) if (!child.killed) child.kill('SIGTERM');
  setTimeout(() => process.exit(0), 300).unref();
}
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
