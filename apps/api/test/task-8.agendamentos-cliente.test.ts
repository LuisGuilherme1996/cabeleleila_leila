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

// 2027-03-01 is a Monday. Use 10:00 local time (within 08:00-18:00).
const SLOT_VALIDO = new Date(2027, 2, 1, 10, 0, 0); // local 10:00
const SLOT_VALIDO_ISO = SLOT_VALIDO.toISOString();

// Second valid slot for concurrent test
const SLOT_VALIDO_2 = new Date(2027, 2, 1, 11, 0, 0);
const SLOT_VALIDO_2_ISO = SLOT_VALIDO_2.toISOString();

// Outside working hours (Sunday)
const SLOT_DOMINGO = new Date(2027, 2, 7, 10, 0, 0); // Sunday 2027-03-07
const SLOT_DOMINGO_ISO = SLOT_DOMINGO.toISOString();

let adminId: string;
let clienteId: string;
let cliente2Id: string;
let adminToken: string;
let clienteToken: string;
let cliente2Token: string;
let servicoId: string; // Corte Masculino = 30 min

beforeAll(async () => {
  await cleanAll();
  await seedPerfis();
  const admin = await seedAdminUser();
  const cliente = await seedClienteUser('cliente@test.com');
  // Create second cliente
  const { rows: perfilRows } = await pool.query<{ id: string }>(
    `SELECT id FROM perfis WHERE nome = 'CLIENTE'`,
  );
  const { rows: cliente2Rows } = await pool.query<{ id: string }>(
    `INSERT INTO usuarios (nome, email, senha_hash, email_confirmado)
     VALUES ('Cliente Dois', 'cliente2@test.com', 'hash', true) RETURNING id`,
  );
  await pool.query(`INSERT INTO usuario_perfis (usuario_id, perfil_id) VALUES ($1, $2)`, [
    cliente2Rows[0]!.id,
    perfilRows[0]!.id,
  ]);

  adminId = admin.id;
  clienteId = cliente.id;
  cliente2Id = cliente2Rows[0]!.id;
  adminToken = makeAdminToken(adminId, 'admin@test.com');
  clienteToken = makeClienteToken(clienteId, 'cliente@test.com');
  cliente2Token = makeClienteToken(cliente2Id, 'cliente2@test.com');

  await seedHorariosFuncionamento();
  const servicos = await seedServicos();
  // Corte Masculino = 30 min
  for (const s of servicos) {
    if (s.nome === 'Corte Masculino') servicoId = s.id;
  }
});

afterEach(async () => {
  await pool.query(`TRUNCATE TABLE agendamentos RESTART IDENTITY CASCADE`);
  await pool.query(`TRUNCATE TABLE bloqueios_agenda RESTART IDENTITY CASCADE`);
});

// ─────────────────────────────────────────────────────────────────────────────
// 8.1 Criar Agendamento
// ─────────────────────────────────────────────────────────────────────────────
describe('Task 8.1 — Agendamentos: Criar', () => {
  it('8.1.1 ✅ CLIENTE cria agendamento em slot disponível → 201 PENDENTE', async () => {
    const res = await request(app)
      .post(BASE)
      .set('Authorization', `Bearer ${clienteToken}`)
      .send({ servicoId, dataHora: SLOT_VALIDO_ISO });
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('PENDENTE');
    expect(res.body.data.clienteId).toBe(clienteId);
  });

  it('8.1.2 ❌ Slot indisponível (já ocupado) → 409', async () => {
    // Seed an existing agendamento
    await pool.query(
      `INSERT INTO agendamentos (cliente_id, servico_id, data_hora, status)
       VALUES ($1, $2, $3, 'PENDENTE')`,
      [clienteId, servicoId, SLOT_VALIDO],
    );
    const res = await request(app)
      .post(BASE)
      .set('Authorization', `Bearer ${cliente2Token}`)
      .send({ servicoId, dataHora: SLOT_VALIDO_ISO });
    expect(res.status).toBe(409);
  });

  it('8.1.3 ❌ Serviço inativo ou inexistente → 404', async () => {
    const res = await request(app)
      .post(BASE)
      .set('Authorization', `Bearer ${clienteToken}`)
      .send({ servicoId: '00000000-0000-0000-0000-000000000000', dataHora: SLOT_VALIDO_ISO });
    expect(res.status).toBe(404);
  });

  it('8.1.4 ❌ Data/hora no passado → 422', async () => {
    const pastDate = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    const res = await request(app)
      .post(BASE)
      .set('Authorization', `Bearer ${clienteToken}`)
      .send({ servicoId, dataHora: pastDate });
    expect(res.status).toBe(422);
  });

  it('8.1.5 ❌ Horário fora do funcionamento (domingo) → 422', async () => {
    const res = await request(app)
      .post(BASE)
      .set('Authorization', `Bearer ${clienteToken}`)
      .send({ servicoId, dataHora: SLOT_DOMINGO_ISO });
    expect(res.status).toBe(422);
  });

  it('8.1.6 ❌ Horário dentro de bloqueio de agenda → 422', async () => {
    // Block the SLOT_VALIDO_2 period
    await pool.query(
      `INSERT INTO bloqueios_agenda (data_inicio, data_fim, motivo) VALUES ($1, $2, 'Bloqueio teste')`,
      [new Date(2027, 2, 1, 11, 0), new Date(2027, 2, 1, 12, 0)],
    );
    const res = await request(app)
      .post(BASE)
      .set('Authorization', `Bearer ${clienteToken}`)
      .send({ servicoId, dataHora: SLOT_VALIDO_2_ISO });
    expect(res.status).toBe(422);
  });

  it('8.1.7 ❌ Token ausente → 401', async () => {
    const res = await request(app)
      .post(BASE)
      .send({ servicoId, dataHora: SLOT_VALIDO_ISO });
    expect(res.status).toBe(401);
  });

  it('8.1.8 ❌ Campos obrigatórios ausentes → 422', async () => {
    const res = await request(app)
      .post(BASE)
      .set('Authorization', `Bearer ${clienteToken}`)
      .send({});
    expect(res.status).toBe(422);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 8.2 Listar Agendamentos
// ─────────────────────────────────────────────────────────────────────────────
describe('Task 8.2 — Agendamentos: Listar', () => {
  beforeEach(async () => {
    await pool.query(`TRUNCATE TABLE agendamentos RESTART IDENTITY CASCADE`);
    // Seed one agendamento for cliente and one for cliente2
    await pool.query(
      `INSERT INTO agendamentos (cliente_id, servico_id, data_hora, status)
       VALUES ($1, $2, $3, 'PENDENTE'), ($4, $2, $5, 'CONFIRMADO')`,
      [clienteId, servicoId, SLOT_VALIDO, cliente2Id, SLOT_VALIDO_2],
    );
  });

  it('8.2.1 ✅ CLIENTE lista seus próprios agendamentos → 200 somente os do próprio', async () => {
    const res = await request(app)
      .get(BASE)
      .set('Authorization', `Bearer ${clienteToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.every((a: { clienteId: string }) => a.clienteId === clienteId)).toBe(true);
    expect(res.body.data.length).toBe(1);
  });

  it('8.2.2 ✅ ADMIN lista todos os agendamentos → 200 todos', async () => {
    const res = await request(app)
      .get(BASE)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);
  });

  it('8.2.3 ✅ Filtro por status → 200 apenas com status filtrado', async () => {
    const res = await request(app)
      .get(BASE)
      .query({ status: 'CONFIRMADO' })
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.every((a: { status: string }) => a.status === 'CONFIRMADO')).toBe(true);
  });

  it('8.2.4 ✅ Filtro por data → 200 agendamentos do período', async () => {
    const res = await request(app)
      .get(BASE)
      .query({ dataInicio: '2027-03-01', dataFim: '2027-03-01' })
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('8.2.5 ❌ Token ausente → 401', async () => {
    const res = await request(app).get(BASE);
    expect(res.status).toBe(401);
  });

  it('8.2.6 ❌ Parâmetro de query inválido → 422', async () => {
    const res = await request(app)
      .get(BASE)
      .query({ status: 'INVALIDO' })
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(422);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 8.3 Cancelar Agendamento
// ─────────────────────────────────────────────────────────────────────────────
describe('Task 8.3 — Agendamentos: Cancelar', () => {
  async function criarAgendamento(
    cId: string,
    dataHora: Date = SLOT_VALIDO,
    status: string = 'PENDENTE',
  ): Promise<string> {
    const { rows } = await pool.query<{ id: string }>(
      `INSERT INTO agendamentos (cliente_id, servico_id, data_hora, status)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [cId, servicoId, dataHora, status],
    );
    return rows[0]!.id;
  }

  it('8.3.1 ✅ CLIENTE cancela seu próprio agendamento PENDENTE → 200 CANCELADO', async () => {
    const id = await criarAgendamento(clienteId);
    const res = await request(app)
      .patch(`${BASE}/${id}/cancelar`)
      .set('Authorization', `Bearer ${clienteToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('CANCELADO');
  });

  it('8.3.2 ✅ ADMIN cancela qualquer agendamento → 200 CANCELADO', async () => {
    const id = await criarAgendamento(cliente2Id);
    const res = await request(app)
      .patch(`${BASE}/${id}/cancelar`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('CANCELADO');
  });

  it('8.3.3 ❌ CLIENTE tenta cancelar agendamento de outro usuário → 403', async () => {
    const id = await criarAgendamento(cliente2Id);
    const res = await request(app)
      .patch(`${BASE}/${id}/cancelar`)
      .set('Authorization', `Bearer ${clienteToken}`);
    expect(res.status).toBe(403);
  });

  it('8.3.4 ❌ Agendamento já cancelado → 409', async () => {
    const id = await criarAgendamento(clienteId, SLOT_VALIDO, 'CANCELADO');
    const res = await request(app)
      .patch(`${BASE}/${id}/cancelar`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(409);
  });

  it('8.3.5 ❌ Agendamento já concluído → 409', async () => {
    const id = await criarAgendamento(clienteId, SLOT_VALIDO, 'CONCLUIDO');
    const res = await request(app)
      .patch(`${BASE}/${id}/cancelar`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(409);
  });

  it('8.3.6 ❌ ID não encontrado → 404', async () => {
    const res = await request(app)
      .patch(`${BASE}/00000000-0000-0000-0000-000000000000/cancelar`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });

  it('8.3.7 ❌ Token ausente → 401', async () => {
    const res = await request(app).patch(`${BASE}/00000000-0000-0000-0000-000000000000/cancelar`);
    expect(res.status).toBe(401);
  });
});
