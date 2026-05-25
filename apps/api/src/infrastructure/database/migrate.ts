/**
 * CLI entrypoint para executar migrations.
 * Execução: npx tsx src/infrastructure/database/migrate.ts
 */

import { resolve } from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: resolve(process.cwd(), '../../.env') });
dotenv.config();

import { runMigrations } from './migrations-runner';
import { pool } from './pool';

runMigrations()
  .catch((err) => {
    console.error('[migrate] Erro ao executar migrations:', err);
    process.exit(1);
  })
  .finally(() => pool.end());
