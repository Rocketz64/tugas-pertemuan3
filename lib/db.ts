import { Pool, QueryResult, QueryResultRow } from 'pg';

declare global {
  var _pgPool: Pool | undefined;
}

const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/expense_tracker';

export const pool =
  global._pgPool ||
  new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

if (process.env.NODE_ENV !== 'production') {
  global._pgPool = pool;
}

export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  try {
    const res = await pool.query<T>(text, params);
    return res;
  } catch (error) {
    console.error('Database query error:', { text, error });
    throw error;
  }
}

export default pool;
