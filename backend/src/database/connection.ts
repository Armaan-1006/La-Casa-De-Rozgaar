import pg from 'pg';
import { createRequire } from 'module';
import { config } from '../config.js';
import { mkdirSync, existsSync } from 'fs';
import { dirname } from 'path';
import { seedDatabase } from './seed.js';
import { runPgMigrations } from './pg-migrate.js';

const require = createRequire(import.meta.url);
const { Pool } = pg;

export type DatabaseInstance = any;

let dbInstance: any = null;
let pgPool: pg.Pool | null = null;
let isInitializing = false;

/**
 * Transforms SQLite-flavored SQL queries into PostgreSQL-compliant queries.
 */
function transformSql(sql: string): string {
  // Replace datetime('now') with NOW()
  let pgSql = sql.replace(/datetime\(\s*'now'\s*\)/gi, 'NOW()');

  // Convert ? placeholders to $1, $2, $3...
  let paramIndex = 1;
  pgSql = pgSql.replace(/\?/g, () => `$${paramIndex++}`);

  return pgSql;
}

/**
 * Creates a PostgreSQL-backed database client with the prepare() and query() interface.
 */
function createPgDatabase(pool: pg.Pool) {
  return {
    isPostgres: true,

    async query(sql: string, params: any[] = []): Promise<{ rows: any[]; rowCount: number }> {
      const pgSql = transformSql(sql);
      const res = await pool.query(pgSql, params);
      return { rows: res.rows, rowCount: res.rowCount || 0 };
    },

    async get(sql: string, params: any[] = []): Promise<any> {
      const pgSql = transformSql(sql);
      const res = await pool.query(pgSql, params);
      return res.rows[0];
    },

    async all(sql: string, params: any[] = []): Promise<any[]> {
      const pgSql = transformSql(sql);
      const res = await pool.query(pgSql, params);
      return res.rows;
    },

    async run(sql: string, params: any[] = []): Promise<{ rowCount: number }> {
      const pgSql = transformSql(sql);
      const res = await pool.query(pgSql, params);
      return { rowCount: res.rowCount || 0 };
    },

    async exec(sql: string): Promise<void> {
      await pool.query(sql);
    },

    prepare(sql: string) {
      const pgSql = transformSql(sql);
      return {
        async get(...params: any[]): Promise<any> {
          const flatParams = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
          const res = await pool.query(pgSql, flatParams);
          return res.rows[0];
        },
        async all(...params: any[]): Promise<any[]> {
          const flatParams = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
          const res = await pool.query(pgSql, flatParams);
          return res.rows;
        },
        async run(...params: any[]): Promise<{ rowCount: number }> {
          const flatParams = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
          const res = await pool.query(pgSql, flatParams);
          return { rowCount: res.rowCount || 0 };
        },
      };
    },
  };
}

/**
 * Creates a SQLite-backed database client.
 */
function createSqliteDatabase(sqliteDb: any) {
  return {
    isPostgres: false,

    async query(sql: string, params: any[] = []): Promise<{ rows: any[]; rowCount: number }> {
      const stmt = sqliteDb.prepare(sql);
      const rows = stmt.all(...params);
      return { rows, rowCount: rows.length };
    },

    async get(sql: string, params: any[] = []): Promise<any> {
      return sqliteDb.prepare(sql).get(...params);
    },

    async all(sql: string, params: any[] = []): Promise<any[]> {
      return sqliteDb.prepare(sql).all(...params);
    },

    async run(sql: string, params: any[] = []): Promise<{ rowCount: number }> {
      const res = sqliteDb.prepare(sql).run(...params);
      return { rowCount: Number(res.changes || 0) };
    },

    async exec(sql: string): Promise<void> {
      sqliteDb.exec(sql);
    },

    prepare(sql: string) {
      const stmt = sqliteDb.prepare(sql);
      return {
        async get(...params: any[]): Promise<any> {
          const flatParams = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
          return stmt.get(...flatParams);
        },
        async all(...params: any[]): Promise<any[]> {
          const flatParams = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
          return stmt.all(...flatParams);
        },
        async run(...params: any[]): Promise<{ rowCount: number }> {
          const flatParams = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
          const res = stmt.run(...flatParams);
          return { rowCount: Number(res.changes || 0) };
        },
      };
    },
  };
}

/**
 * Gets the database connection singleton.
 */
export function getDb(): any {
  if (dbInstance) {
    return dbInstance;
  }

  const dbUrl = config.database.url || process.env.DATABASE_URL;

  if (dbUrl) {
    // PostgreSQL connection
    pgPool = new Pool({
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    pgPool.on('error', (err) => {
      console.error('[DB] PostgreSQL pool error (handled):', err.message);
    });

    dbInstance = createPgDatabase(pgPool);

    if (!isInitializing) {
      isInitializing = true;
      runPgMigrations()
        .then(() => console.log('[DB] PostgreSQL migrations verified on connect'))
        .catch((err) => console.error('[DB] PostgreSQL migration check warning:', err.message))
        .finally(() => {
          isInitializing = false;
        });
    }

    return dbInstance;
  }

  // SQLite fallback
  const { DatabaseSync } = require('node:sqlite');
  let dbPath = config.database.path;
  try {
    const dir = dirname(dbPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  } catch {
    dbPath = '/tmp/module2.db';
  }

  let sqliteDb: any;
  try {
    sqliteDb = new DatabaseSync(dbPath);
  } catch {
    sqliteDb = new DatabaseSync(':memory:');
  }

  try {
    sqliteDb.exec('PRAGMA journal_mode = WAL;');
  } catch {}
  try {
    sqliteDb.exec('PRAGMA foreign_keys = ON;');
  } catch {}

  dbInstance = createSqliteDatabase(sqliteDb);

  if (!isInitializing) {
    isInitializing = true;
    try {
      seedDatabase();
    } catch (err) {
      console.error('[DB] SQLite auto-seed error:', err);
    } finally {
      isInitializing = false;
    }
  }

  return dbInstance;
}

export function closeDb(): void {
  if (pgPool) {
    pgPool.end().catch(() => {});
    pgPool = null;
  }
  dbInstance = null;
}

// Utility for generating request IDs
export function generateId(): string {
  return crypto.randomUUID();
}
