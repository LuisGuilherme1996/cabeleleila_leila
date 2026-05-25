import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { cleanAll, seedPerfis, seedAdminUser, seedClienteUser } from './helpers/db.helper.js';
import { makeAdminToken, makeClienteToken } from './helpers/auth.helper.js';
import { pool } from '../src/infrastructure/database/pool.js';

const BASE = '/api/catalog/bloqueios';

let adminToken: string;
let clienteToken: string;

function futureISO(hoursFromNow: number): string {
  return new Date(Date.now() + hoursFromNow * 60 * 60 * 1000).toISOString();
}

beforeAll(async () => {
  await cleanAll();
  await seedPerfis();
  const admin = await seedAdminUser();
  const cliente = await seedClienteUser();
  adminToken = makeAdminToken(admin.id, 'admin@test.com');
  clienteToken = makeClienteToken(cliente.id, 'cliente@test.com');
});

afterEach(async () => {
  await pool.query(`TRUNCATE TABLE bloqueios_agenda RESTART IDENTITY CASCADE`);
});

// ─────────────────────────────────────────────────────────────────────────────
// 6.1 Listar Bloqueios
// ─────────────────────────────────────────────────────────────────────────────
describe('Task 6.1 — Catalog: Listar Bloqueios', () => {
  it('6.1.1 ✅ ADMIN lista bloqueios → 200 array', async () => {
    await pool.query(`
      INSERT INTO bloqueios_agenda (data_inicio, data_fim, motivo)
      VALUES (NOW() + INTERVAL '1 hour', NOW() + INTERVAL '2 hours', 'Teste')
    `);
    const res = await request(app)
      .get(BASE)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('6.1.2 ❌ CLIENTE tenta listar → 403', async () => {
    const res = await request(app)
      .get(BASE)
      .set('Authorization', `Bearer ${clienteToken}`);
    expect(res.status).toBe(403);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6.2 Criar Bloqueio
// ─────────────────────────────────────────────────────────────────────────────
describe('Task 6.2 — Catalog: Criar Bloqueio', () => {
  it('6.2.1 ✅ ADMIN cria bloqueio com data futura → 201', async () => {
    const res = await request(app)
      .post(BASE)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        dataInicio: futureISO(2),
        dataFim: futureISO(4),
        motivo: 'Feriado nacional',
      });
    expect(res.status).toBe(201);
    expect(res.body.data.motivo).toBe('Feriado nacional');
  });

  it('6.2.2 ❌ Data no passado → 422', async () => {
    const pastDate = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    const futureDate = futureISO(1);
    const res = await request(app)
      .post(BASE)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ dataInicio: pastDate, dataFim: futureDate, motivo: 'Passado' });
    expect(res.status).toBe(422);
  });

  it('6.2.3 ❌ Fim anterior ao início → 422', async () => {
    const res = await request(app)
      .post(BASE)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        dataInicio: futureISO(4),
        dataFim: futureISO(2),
        motivo: 'Ordem errada',
      });
    expect(res.status).toBe(422);
  });

  it('6.2.4 ❌ Conflito com bloqueio existente → 409', async () => {
    // Create the first bloqueio
    await request(app)
      .post(BASE)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ dataInicio: futureISO(2), dataFim: futureISO(5), motivo: 'Primeiro bloqueio' });
    // Try to create overlapping bloqueio
    const res = await request(app)
      .post(BASE)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ dataInicio: futureISO(3), dataFim: futureISO(6), motivo: 'Conflito' });
    expect(res.status).toBe(409);
  });

  it('6.2.5 ❌ CLIENTE tenta criar → 403', async () => {
    const res = await request(app)
      .post(BASE)
      .set('Authorization', `Bearer ${clienteToken}`)
      .send({ dataInicio: futureISO(2), dataFim: futureISO(4), motivo: 'Teste' });
    expect(res.status).toBe(403);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6.3 Remover Bloqueio
// ─────────────────────────────────────────────────────────────────────────────
describe('Task 6.3 — Catalog: Remover Bloqueio', () => {
  async function criarBloqueio(): Promise<string> {
    const { rows } = await pool.query<{ id: string }>(`
      INSERT INTO bloqueios_agenda (data_inicio, data_fim, motivo)
      VALUES (NOW() + INTERVAL '2 hours', NOW() + INTERVAL '4 hours', 'Para remover')
      RETURNING id
    `);
    return rows[0]!.id;
  }

  it('6.3.1 ✅ ADMIN remove bloqueio existente → 204', async () => {
    const id = await criarBloqueio();
    const res = await request(app)
      .delete(`${BASE}/${id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(204);
  });

  it('6.3.2 ❌ ID não encontrado → 404', async () => {
    const res = await request(app)
      .delete(`${BASE}/00000000-0000-0000-0000-000000000000`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });

  it('6.3.3 ❌ ID não é UUID → 422', async () => {
    const res = await request(app)
      .delete(`${BASE}/nao-e-uuid`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(422);
  });

  it('6.3.4 ❌ CLIENTE tenta remover → 403', async () => {
    const id = await criarBloqueio();
    const res = await request(app)
      .delete(`${BASE}/${id}`)
      .set('Authorization', `Bearer ${clienteToken}`);
    expect(res.status).toBe(403);
  });
});
