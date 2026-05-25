import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { cleanAll, seedPerfis, seedAdminUser, seedClienteUser } from './helpers/db.helper.js';
import { makeAdminToken, makeClienteToken } from './helpers/auth.helper.js';
import { pool } from '../src/infrastructure/database/pool.js';

const BASE = '/api/catalog/servicos';

let adminId: string;
let clienteId: string;
let adminToken: string;
let clienteToken: string;

beforeAll(async () => {
  await cleanAll();
  await seedPerfis();
  const admin = await seedAdminUser();
  const cliente = await seedClienteUser();
  adminId = admin.id;
  clienteId = cliente.id;
  adminToken = makeAdminToken(adminId, 'admin@test.com');
  clienteToken = makeClienteToken(clienteId, 'cliente@test.com');
});

afterEach(async () => {
  await pool.query(`TRUNCATE TABLE agendamentos, servicos RESTART IDENTITY CASCADE`);
});

// ─────────────────────────────────────────────────────────────────────────────
// 4.1 Listar Serviços
// ─────────────────────────────────────────────────────────────────────────────
describe('Task 4.1 — Catalog: Listar Serviços', () => {
  it('4.1.1 ✅ Listagem com token válido → 200 array', async () => {
    await pool.query(`
      INSERT INTO servicos (nome, preco, duracao_minutos) VALUES ('Corte', 50, 30)
    `);
    const res = await request(app)
      .get(BASE)
      .set('Authorization', `Bearer ${clienteToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('4.1.2 ❌ Token ausente → 401', async () => {
    const res = await request(app).get(BASE);
    expect(res.status).toBe(401);
  });

  it('4.1.3 ✅ Lista vazia → 200 []', async () => {
    const res = await request(app)
      .get(BASE)
      .set('Authorization', `Bearer ${clienteToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4.2 Obter Serviço por ID
// ─────────────────────────────────────────────────────────────────────────────
describe('Task 4.2 — Catalog: Obter Serviço por ID', () => {
  it('4.2.1 ✅ ID válido UUID existente → 200', async () => {
    const { rows } = await pool.query<{ id: string }>(
      `INSERT INTO servicos (nome, preco, duracao_minutos) VALUES ('Teste', 80, 60) RETURNING id`,
    );
    const id = rows[0]!.id;
    const res = await request(app).get(`${BASE}/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(id);
  });

  it('4.2.2 ❌ ID não encontrado → 404', async () => {
    const res = await request(app).get(`${BASE}/00000000-0000-0000-0000-000000000000`);
    expect(res.status).toBe(404);
  });

  it('4.2.3 ❌ ID não é UUID → 422', async () => {
    const res = await request(app).get(`${BASE}/nao-e-uuid`);
    expect(res.status).toBe(422);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4.3 Criar Serviço
// ─────────────────────────────────────────────────────────────────────────────
describe('Task 4.3 — Catalog: Criar Serviço', () => {
  it('4.3.1 ✅ ADMIN cria serviço com dados válidos → 201', async () => {
    const res = await request(app)
      .post(BASE)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nome: 'Corte Feminino', preco: 80, duracaoMinutos: 60 });
    expect(res.status).toBe(201);
    expect(res.body.data.nome).toBe('Corte Feminino');
  });

  it('4.3.2 ❌ CLIENTE tenta criar → 403', async () => {
    const res = await request(app)
      .post(BASE)
      .set('Authorization', `Bearer ${clienteToken}`)
      .send({ nome: 'Corte', preco: 50, duracaoMinutos: 30 });
    expect(res.status).toBe(403);
  });

  it('4.3.3 ❌ Token ausente → 401', async () => {
    const res = await request(app)
      .post(BASE)
      .send({ nome: 'Corte', preco: 50, duracaoMinutos: 30 });
    expect(res.status).toBe(401);
  });

  it('4.3.4 ❌ Campos obrigatórios ausentes → 422', async () => {
    const res = await request(app)
      .post(BASE)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nome: 'Corte' }); // missing preco and duracaoMinutos
    expect(res.status).toBe(422);
  });

  it('4.3.5 ❌ Preço negativo → 422', async () => {
    const res = await request(app)
      .post(BASE)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nome: 'Corte', preco: -10, duracaoMinutos: 30 });
    expect(res.status).toBe(422);
  });

  it('4.3.5b ❌ Duração zero → 422', async () => {
    const res = await request(app)
      .post(BASE)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nome: 'Corte', preco: 50, duracaoMinutos: 0 });
    expect(res.status).toBe(422);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4.4 Atualizar Serviço
// ─────────────────────────────────────────────────────────────────────────────
describe('Task 4.4 — Catalog: Atualizar Serviço', () => {
  async function criarServico(): Promise<string> {
    const { rows } = await pool.query<{ id: string }>(
      `INSERT INTO servicos (nome, preco, duracao_minutos) VALUES ('Para Atualizar', 50, 30) RETURNING id`,
    );
    return rows[0]!.id;
  }

  it('4.4.1 ✅ ADMIN atualiza serviço existente → 200', async () => {
    const id = await criarServico();
    const res = await request(app)
      .put(`${BASE}/${id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nome: 'Nome Atualizado', preco: 100, duracaoMinutos: 45 });
    expect(res.status).toBe(200);
    expect(res.body.data.nome).toBe('Nome Atualizado');
  });

  it('4.4.2 ❌ ID não encontrado → 404', async () => {
    const res = await request(app)
      .put(`${BASE}/00000000-0000-0000-0000-000000000000`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nome: 'Nome Valido', preco: 10, duracaoMinutos: 30 });
    expect(res.status).toBe(404);
  });

  it('4.4.3 ❌ CLIENTE tenta atualizar → 403', async () => {
    const id = await criarServico();
    const res = await request(app)
      .put(`${BASE}/${id}`)
      .set('Authorization', `Bearer ${clienteToken}`)
      .send({ nome: 'Nome Valido', preco: 10, duracaoMinutos: 30 });
    expect(res.status).toBe(403);
  });

  it('4.4.4 ❌ Token ausente → 401', async () => {
    const id = await criarServico();
    const res = await request(app)
      .put(`${BASE}/${id}`)
      .send({ nome: 'Nome Valido', preco: 10, duracaoMinutos: 30 });
    expect(res.status).toBe(401);
  });

  it('4.4.5 ❌ Payload inválido (preço negativo) → 422', async () => {
    const id = await criarServico();
    const res = await request(app)
      .put(`${BASE}/${id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ preco: -5 });
    expect(res.status).toBe(422);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4.5 Inativar Serviço
// ─────────────────────────────────────────────────────────────────────────────
describe('Task 4.5 — Catalog: Inativar Serviço', () => {
  async function criarServico(): Promise<string> {
    const { rows } = await pool.query<{ id: string }>(
      `INSERT INTO servicos (nome, preco, duracao_minutos, ativo) VALUES ('Para Inativar', 50, 30, TRUE) RETURNING id`,
    );
    return rows[0]!.id;
  }

  it('4.5.1 ✅ ADMIN inativa serviço ativo → 200', async () => {
    const id = await criarServico();
    const res = await request(app)
      .patch(`${BASE}/${id}/inativar`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.ativo).toBe(false);
  });

  it('4.5.2 ✅ Serviço já inativo (idempotência) → 200', async () => {
    const id = await criarServico();
    // Inativar twice
    await request(app)
      .patch(`${BASE}/${id}/inativar`)
      .set('Authorization', `Bearer ${adminToken}`);
    const res = await request(app)
      .patch(`${BASE}/${id}/inativar`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.ativo).toBe(false);
  });

  it('4.5.3 ❌ ID não encontrado → 404', async () => {
    const res = await request(app)
      .patch(`${BASE}/00000000-0000-0000-0000-000000000000/inativar`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });

  it('4.5.4 ❌ CLIENTE tenta inativar → 403', async () => {
    const id = await criarServico();
    const res = await request(app)
      .patch(`${BASE}/${id}/inativar`)
      .set('Authorization', `Bearer ${clienteToken}`);
    expect(res.status).toBe(403);
  });
});
