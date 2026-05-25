import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { cleanAll, seedPerfis, seedAdminUser, seedClienteUser } from './helpers/db.helper.js';
import { makeAdminToken, makeClienteToken } from './helpers/auth.helper.js';
import { pool } from '../src/infrastructure/database/pool.js';

const BASE = '/api/catalog/horarios';

let adminToken: string;
let clienteToken: string;

beforeAll(async () => {
  await cleanAll();
  await seedPerfis();
  const admin = await seedAdminUser();
  const cliente = await seedClienteUser();
  adminToken = makeAdminToken(admin.id, 'admin@test.com');
  clienteToken = makeClienteToken(cliente.id, 'cliente@test.com');
});

afterEach(async () => {
  await pool.query(`TRUNCATE TABLE horarios_funcionamento RESTART IDENTITY CASCADE`);
});

// ─────────────────────────────────────────────────────────────────────────────
// 5.1 Listar Horários
// ─────────────────────────────────────────────────────────────────────────────
describe('Task 5.1 — Catalog: Listar Horários', () => {
  it('5.1.1 ✅ ADMIN lista horários configurados → 200 array', async () => {
    await pool.query(`
      INSERT INTO horarios_funcionamento (dia_semana, hora_inicio, hora_fim, fechado)
      VALUES (1, '08:00', '18:00', FALSE)
    `);
    const res = await request(app)
      .get(BASE)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('5.1.2 ❌ CLIENTE tenta listar → 403', async () => {
    const res = await request(app)
      .get(BASE)
      .set('Authorization', `Bearer ${clienteToken}`);
    expect(res.status).toBe(403);
  });

  it('5.1.3 ❌ Token ausente → 401', async () => {
    const res = await request(app).get(BASE);
    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5.2 Salvar Horários
// ─────────────────────────────────────────────────────────────────────────────
describe('Task 5.2 — Catalog: Salvar Horários', () => {
  it('5.2.1 ✅ ADMIN salva horários válidos (upsert) → 200', async () => {
    const res = await request(app)
      .put(BASE)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ diaSemana: 1, horaInicio: '08:00', horaFim: '18:00', fechado: false });
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ diaSemana: 1, horaInicio: '08:00', horaFim: '18:00' });
  });

  it('5.2.2 ❌ Horário inválido (fim antes do início) → 422', async () => {
    const res = await request(app)
      .put(BASE)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ diaSemana: 2, horaInicio: '18:00', horaFim: '08:00', fechado: false });
    expect(res.status).toBe(422);
  });

  it('5.2.3 ❌ Dia da semana inválido → 422', async () => {
    const res = await request(app)
      .put(BASE)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ diaSemana: 7, horaInicio: '08:00', horaFim: '18:00' });
    expect(res.status).toBe(422);
  });

  it('5.2.4 ❌ CLIENTE tenta salvar → 403', async () => {
    const res = await request(app)
      .put(BASE)
      .set('Authorization', `Bearer ${clienteToken}`)
      .send({ diaSemana: 1, horaInicio: '08:00', horaFim: '18:00' });
    expect(res.status).toBe(403);
  });
});
