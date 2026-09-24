import { createRequire } from 'module';
import { config } from '../config.js';
import { mkdirSync, existsSync } from 'fs';
import { dirname } from 'path';

const require = createRequire(import.meta.url);
const { DatabaseSync } = require('node:sqlite');

export type DatabaseInstance = any;

let db: any = null;

export function getDb(): any {
  if (!db) {
    const dbPath = config.database.path;
    const dir = dirname(dbPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    db = new DatabaseSync(dbPath);
    db.exec('PRAGMA journal_mode = WAL;');
    db.exec('PRAGMA foreign_keys = ON;');
  }
  return db;
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}

// Utility for generating request IDs
export function generateId(): string {
  return crypto.randomUUID();
}
