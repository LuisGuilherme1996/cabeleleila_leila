import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pool, query } from './pool';

const MIGRATIONS_DIR = join(process.cwd(), 'migrations');

async function ensureMigrationsTable(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id         SERIAL PRIMARY KEY,
      filename   VARCHAR(255) NOT NULL UNIQUE,
      aplicado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function getAppliedMigrations(): Promise<string[]> {
  const rows = await query<{ filename: string }>(
    'SELECT filename FROM _migrations ORDER BY id',
  );
  return rows.map((r) => r.filename);
}

export async function runMigrations(): Promise<void> {
  await ensureMigrationsTable();

  const applied = await getAppliedMigrations();

  const files = (await readdir(MIGRATIONS_DIR))
    .filter((f) => f.endsWith('.sql'))
    .sort();

  const pending = files.filter((f) => !applied.includes(f));

  if (pending.length === 0) {
    console.log('[migrations] Nenhuma migration pendente.');
    return;
  }

  const client = await pool.connect();
  try {
    for (const file of pending) {
      const sql = await readFile(join(MIGRATIONS_DIR, file), 'utf-8');
      console.log(`[migrations] Aplicando: ${file}`);
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO _migrations (filename) VALUES ($1)', [file]);
      await client.query('COMMIT');
      console.log(`[migrations] Concluída: ${file}`);
    }
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
