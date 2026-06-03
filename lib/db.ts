import { Pool } from 'pg';

/**
 * Lazy singleton Postgres pool.
 *
 * The pool (and the DATABASE_URL check) is created on FIRST USE — never at module
 * import — so importing this file during `next build` (page-data collection) does
 * not require DATABASE_URL. The variable is only needed at request time, when a
 * DB-backed route actually runs. Set DATABASE_URL in the deployment environment.
 */
let poolInstance: Pool | null = null;

function getPool(): Pool {
  if (!poolInstance) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    poolInstance = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
    });
  }
  return poolInstance;
}

// Proxy so existing `import pool from '@/lib/db'; pool.query(...)` call sites work
// unchanged, while deferring pool creation until the first property access.
const pool = new Proxy({} as Pool, {
  get(_target, prop) {
    const instance = getPool();
    const value = instance[prop as keyof Pool];
    return typeof value === 'function' ? (value as (...args: unknown[]) => unknown).bind(instance) : value;
  },
});

export default pool;
