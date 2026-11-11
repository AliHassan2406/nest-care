import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const here = path.dirname(fileURLToPath(import.meta.url));
// Read backend/.env without relying on the shell's current working directory.
dotenv.config({ path: path.resolve(here, '../../.env') });

export const JWT_SECRET = process.env.JWT_SECRET || 'dev-local-secret-change-before-deployment';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
