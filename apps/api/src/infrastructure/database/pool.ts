import { Pool, QueryResult, QueryResultRow } from 'pg';
import { env } from '../../config/env';

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

export async function query<T extends QueryResultRow>(sql: string, params?: unknown[]): Promise<T[]> {
  const result: QueryResult<T> = await pool.query<T>(sql, params);
  return result.rows;
}
