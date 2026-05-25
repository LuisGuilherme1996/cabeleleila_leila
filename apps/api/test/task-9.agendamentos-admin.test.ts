import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import {
  cleanAll,
  seedPerfis,
  seedAdminUser,
  seedClienteUser,
  seedServicos,
  seedHorariosFuncionamento,
} from './helpers/db.helper.js';
import { makeAdminToken, makeClienteToken } from './helpers/auth.helper.js';
import { pool } from '../src/infrastructure/database/pool.js';

const BASE = '/api/agendamentos';

// 2027-03-01 is a Monday within working hours
const SLOT_VALIDO = new Date(2027, 2, 1, 10, 0, 0);
const NON_EXISTENT_ID = '00000000-0000-0000-0000-000000000000';

let adminId: string;
let clienteId: string;
let adminToken: string;
let clienteToken: string;
let servicoId: string;

beforeAll(async () => {
  await cleanAll();
  await seedPerfis();
  const admin = await seedAdminUser();
  const cliente = await seedClienteUser('cliente@test.com');
  adminId = admin.id;
  clienteId = cliente.id;
  adminToken = makeAdminToken(adminId, 'admin@test.com');
  clienteToken = makeClienteToken(clienteId, 'cliente@test.com');
  await seedHorariosFuncionamento();
  const servicos = await seedServicos();
  for (const s of servicos) {
    if (s.nome === 'Corte Masculino') servicoId = s.id;
  }
});

afterEach(async () => {
  await pool.query(`TRUNCATE TABLE agendamentos RESTART IDENTITY CASCADE`);
});

async function criarAgendamentoDB(status: string = 'PENDENTE'): Promise<string> {
  const { rows } = await pool.query<{ id: string }>(
    `INSERT INTO agendamentos (cliente_id, servico_id, data_hora, status)
     VALUES ($1, $2, $3, $4) RETURNING id`,
    [clienteId, servicoId, SLOT_VALIDO, status],
  );
  return rows[0]!.id;
}

// ─────────────────────────────────────────────────────────────────────────────
// 9.1 Confirmar Agendamento
// ─────────────────────────────────────────────────────────────────────────────
describe('Task 9.1 — Confirmar Agendamento', () => {
  it('9.1.1 ✅ ADMIN confirma agendamento PENDENTE → 200 CONFIRMADO', async () => {
    const id = await criarAgendamentoDB('PENDENTE');
    const res = await request(app)
      .patch(`${BASE}/${id}/confirmar`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('CONFIRMADO');
  });

  it('9.1.2 ❌ Agendamento já confirmado → 409', async () => {
    const id = await criarAgendamentoDB('CONFIRMADO');
    const res = await request(app)
      .patch(`${BASE}/${id}/confirmar`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(409);
  });

  it('9.1.3 ❌ Agendamento cancelado → 409', async () => {
    const id = await criarAgendamentoDB('CANCELADO');
    const res = await request(app)
      .patch(`${BASE}/${id}/confirmar`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(409);
  });

  it('9.1.4 ❌ ID não encontrado → 404', async () => {
    const res = await request(app)
      .patch(`${BASE}/${NON_EXISTENT_ID}/confirmar`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });

  it('9.1.5 ❌ CLIENTE tenta confirmar → 403', async () => {
    const id = await criarAgendamentoDB('PENDENTE');
    const res = await request(app)
      .patch(`${BASE}/${id}/confirmar`)
      .set('Authorization', `Bearer ${clienteToken}`);
    expect(res.status).toBe(403);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 9.2 Concluir Agendamento
// ─────────────────────────────────────────────────────────────────────────────
describe('Task 9.2 — Concluir Agendamento', () => {
  it('9.2.1 ✅ ADMIN conclui agendamento CONFIRMADO → 200 CONCLUIDO', async () => {
    const id = await criarAgendamentoDB('CONFIRMADO');
    const res = await request(app)
      .patch(`${BASE}/${id}/concluir`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('CONCLUIDO');
  });

  it('9.2.2 ❌ Agendamento ainda PENDENTE → 409', async () => {
    const id = await criarAgendamentoDB('PENDENTE');
    const res = await request(app)
      .patch(`${BASE}/${id}/concluir`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(409);
  });

  it('9.2.3 ❌ Agendamento cancelado → 409', async () => {
    const id = await criarAgendamentoDB('CANCELADO');
    const res = await request(app)
      .patch(`${BASE}/${id}/concluir`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(409);
  });

  it('9.2.4 ❌ ID não encontrado → 404', async () => {
    const res = await request(app)
      .patch(`${BASE}/${NON_EXISTENT_ID}/concluir`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });

  it('9.2.5 ❌ CLIENTE tenta concluir → 403', async () => {
    const id = await criarAgendamentoDB('CONFIRMADO');
    const res = await request(app)
      .patch(`${BASE}/${id}/concluir`)
      .set('Authorization', `Bearer ${clienteToken}`);
    expect(res.status).toBe(403);
  });
});
