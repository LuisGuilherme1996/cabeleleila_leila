import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { cleanAll, seedPerfis, seedAdminUser, seedClienteUser } from './helpers/db.helper.js';
import { makeAdminToken, makeClienteToken, makeExpiredToken } from './helpers/auth.helper.js';

const BASE = '/api/users';

let adminId: string;
let clienteId: string;

beforeAll(async () => {
  await cleanAll();
  await seedPerfis();
  const admin = await seedAdminUser();
  const cliente = await seedClienteUser();
  adminId = admin.id;
  clienteId = cliente.id;
});

// ─────────────────────────────────────────────────────────────────────────────
// 3.1 Obter Perfil
// ─────────────────────────────────────────────────────────────────────────────
describe('Task 3.1 — Users: Obter Perfil', () => {
  it('3.1.1 ✅ Token válido → 200 dados do perfil', async () => {
    const token = makeClienteToken(clienteId, 'cliente@test.com');
    const res = await request(app)
      .get(`${BASE}/me`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({
      email: 'cliente@test.com',
    });
  });

  it('3.1.2 ❌ Token ausente → 401', async () => {
    const res = await request(app).get(`${BASE}/me`);
    expect(res.status).toBe(401);
  });

  it('3.1.3 ❌ Token expirado ou inválido → 401', async () => {
    const expiredToken = makeExpiredToken(clienteId);
    const res = await request(app)
      .get(`${BASE}/me`)
      .set('Authorization', `Bearer ${expiredToken}`);
    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3.2 Atualizar Perfil
// ─────────────────────────────────────────────────────────────────────────────
describe('Task 3.2 — Users: Atualizar Perfil', () => {
  it('3.2.1 ✅ Atualizar nome com dados válidos → 200', async () => {
    const token = makeClienteToken(clienteId, 'cliente@test.com');
    const res = await request(app)
      .patch(`${BASE}/me`)
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'Novo Nome Cliente' });
    expect(res.status).toBe(200);
    expect(res.body.data.nome).toBe('Novo Nome Cliente');
  });

  it('3.2.2 ✅ Atualizar telefone (campo opcional) → 200', async () => {
    const token = makeClienteToken(clienteId, 'cliente@test.com');
    const res = await request(app)
      .patch(`${BASE}/me`)
      .set('Authorization', `Bearer ${token}`)
      .send({ telefone: '(11) 98888-0000' });
    expect(res.status).toBe(200);
  });

  it('3.2.3 ❌ Token ausente → 401', async () => {
    const res = await request(app).patch(`${BASE}/me`).send({ nome: 'X' });
    expect(res.status).toBe(401);
  });

  it('3.2.4 ❌ Nome vazio (inválido) → 422', async () => {
    const token = makeClienteToken(clienteId, 'cliente@test.com');
    const res = await request(app)
      .patch(`${BASE}/me`)
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'A' }); // less than 2 chars
    expect(res.status).toBe(422);
  });

  it('3.2.5 ❌ Payload completamente vazio → 422', async () => {
    const token = makeClienteToken(clienteId, 'cliente@test.com');
    const res = await request(app)
      .patch(`${BASE}/me`)
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(res.status).toBe(422);
  });
});
