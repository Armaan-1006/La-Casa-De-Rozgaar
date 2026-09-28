import pg from 'pg';
import { config } from '../config/index.js';

const { Pool } = pg;

// Determine SSL options for cloud databases (Neon, Railway, AWS, etc.)
const useSsl =
  (config.database.url &&
    (config.database.url.includes('sslmode=require') ||
      config.database.url.includes('neon.tech') ||
      config.database.url.includes('aws.neon.tech') ||
      config.database.url.includes('railway'))) ||
  config.nodeEnv === 'production';

// Create PostgreSQL connection pool
export const pool = new Pool(
  config.database.url
    ? {
        connectionString: config.database.url,
        max: config.database.maxConnections,
        idleTimeoutMillis: config.database.idleTimeout,
        connectionTimeoutMillis: 10000,
        ssl: useSsl ? { rejectUnauthorized: false } : undefined,
      }
    : {
        host: config.database.host,
        port: config.database.port,
        database: config.database.name,
        user: config.database.user,
        password: config.database.password,
        max: config.database.maxConnections,
        idleTimeoutMillis: config.database.idleTimeout,
        connectionTimeoutMillis: 10000,
        ssl: useSsl ? { rejectUnauthorized: false } : undefined,
      }
);

// Handle pool errors safely without crashing process in serverless
pool.on('error', (err) => {
  console.error('Unexpected database pool error (handled):', err.message);
});

// Test database connection
export async function testConnection(): Promise<boolean> {
  if (!config.database.url && (!config.database.host || config.database.host === 'localhost')) {
    // If not configured, report false gracefully without throwing
    return false;
  }
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error instanceof Error ? error.message : error);
    return false;
  }
}

// Close database pool
export async function closePool(): Promise<void> {
  await pool.end();
}

// Query helper with error handling
export async function query<T extends pg.QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<pg.QueryResult<T>> {
  const start = Date.now();
  try {
    const result = await pool.query<T>(text, params);
    const duration = Date.now() - start;

    // Log slow queries in development
    if (config.nodeEnv === 'development' && duration > 1000) {
      console.warn(`Slow query (${duration}ms):`, text.substring(0, 100));
    }

    return result;
  } catch (error) {
    console.error('Database query error:', {
      text: text.substring(0, 100),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

// Transaction helper
export async function transaction<T>(
  callback: (client: pg.PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export default pool;
