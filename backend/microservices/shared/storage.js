import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import './env.js';

const here = path.dirname(fileURLToPath(import.meta.url));
export const DATA_DIR = path.resolve(here, '../../data');
fs.mkdirSync(DATA_DIR, { recursive: true });

const configuredDatabasePath = process.env.NESTCARE_DB_PATH || path.join(DATA_DIR, 'nestcare.sqlite');
export const DATABASE_PATH = path.resolve(configuredDatabasePath);
fs.mkdirSync(path.dirname(DATABASE_PATH), { recursive: true });
const db = new DatabaseSync(DATABASE_PATH);
db.exec(`
  PRAGMA busy_timeout = 5000;
  CREATE TABLE IF NOT EXISTS collections (
    name TEXT PRIMARY KEY,
    payload TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`);

const selectCollection = db.prepare('SELECT payload FROM collections WHERE name = ?');
const insertCollectionIfMissing = db.prepare(
  'INSERT OR IGNORE INTO collections (name, payload, updated_at) VALUES (?, ?, ?)'
);
const upsertCollection = db.prepare(`
  INSERT INTO collections (name, payload, updated_at) VALUES (?, ?, ?)
  ON CONFLICT(name) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at
`);
const healthCheck = db.prepare('SELECT 1 AS ok');

export function isDatabaseReady() {
  try {
    return healthCheck.get()?.ok === 1;
  } catch (error) {
    console.error('[storage] SQLite health check failed:', error.message);
    return false;
  }
}

function safeName(name) {
  if (!/^[a-z0-9_-]+\.json$/i.test(name)) throw new Error('Invalid data collection name');
  return name;
}

function collectionKey(name) {
  return safeName(name).replace(/\.json$/i, '');
}

function parsePayload(payload, name, fallback) {
  try {
    return JSON.parse(payload) ?? fallback;
  } catch (error) {
    console.error(`[storage] Could not parse SQLite collection ${name}:`, error.message);
    return fallback;
  }
}

/**
 * Reads a named collection from SQLite. On first use, imports the matching
 * JSON seed file (when present), or stores the supplied fallback value.
 */
export function readCollection(name, fallback = []) {
  const key = collectionKey(name);
  let row = selectCollection.get(key);
  if (row) return parsePayload(row.payload, name, fallback);

  let initialValue = fallback;
  const seedFile = path.join(DATA_DIR, safeName(name));
  try {
    if (fs.existsSync(seedFile)) {
      initialValue = JSON.parse(fs.readFileSync(seedFile, 'utf8')) ?? fallback;
    }
  } catch (error) {
    console.error(`[storage] Could not import seed ${name}:`, error.message);
  }

  insertCollectionIfMissing.run(key, JSON.stringify(initialValue), new Date().toISOString());
  row = selectCollection.get(key);
  return row ? parsePayload(row.payload, name, fallback) : initialValue;
}

/** Persists a whole collection atomically as a SQLite upsert. */
export function writeCollection(name, value) {
  const key = collectionKey(name);
  const payload = JSON.stringify(value);
  if (payload === undefined) throw new Error(`Collection ${name} must be JSON serializable`);
  upsertCollection.run(key, payload, new Date().toISOString());
}
