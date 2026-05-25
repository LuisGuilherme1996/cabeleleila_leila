/**
 * Global test setup — runs once before all tests.
 * Cleans all tables before the full test suite starts and after each test file.
 */
import { afterAll, afterEach, beforeAll } from 'vitest';
import { pool } from '../src/infrastructure/database/pool.js';

export async function cleanDatabase(): Promise<void> {
  await pool.query(`
    TRUNCATE TABLE
      agendamentos,
      bloqueios_agenda,
      horarios_funcionamento,
      servicos,
      sessoes_refresh_token,
      tokens_acao,
      conexoes_oauth,
      usuario_perfis,
      perfis,
      usuarios
    RESTART IDENTITY CASCADE
  `);
}

beforeAll(async () => {
  await cleanDatabase();
});

afterAll(async () => {
  await pool.end();
});
