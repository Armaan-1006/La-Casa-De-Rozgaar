import { createRequire } from 'module';
import { config } from '../config.js';
import { mkdirSync, existsSync } from 'fs';
import { dirname } from 'path';
import { seedDatabase } from './seed.js';
const require = createRequire(import.meta.url);
const { DatabaseSync } = require('node:sqlite');
let db = null;
let isInitializing = false;
export function getDb() {
    if (!db) {
        let dbPath = config.database.path;
        try {
            const dir = dirname(dbPath);
            if (!existsSync(dir)) {
                mkdirSync(dir, { recursive: true });
            }
        }
        catch {
            dbPath = '/tmp/module2.db';
        }
        try {
            db = new DatabaseSync(dbPath);
        }
        catch {
            db = new DatabaseSync(':memory:');
        }
        try {
            db.exec('PRAGMA journal_mode = WAL;');
        }
        catch { }
        try {
            db.exec('PRAGMA foreign_keys = ON;');
        }
        catch { }
        if (!isInitializing) {
            isInitializing = true;
            try {
                seedDatabase();
            }
            catch (err) {
                console.error('[DB] Auto-seed error:', err);
            }
            finally {
                isInitializing = false;
            }
        }
    }
    return db;
}
export function closeDb() {
    if (db) {
        db.close();
        db = null;
    }
}
// Utility for generating request IDs
export function generateId() {
    return crypto.randomUUID();
}
//# sourceMappingURL=connection.js.map