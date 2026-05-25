import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import {
  cleanAll,
  seedPerfis,
  seedAdminUser,
  seedClienteUser,
} from './helpers/db.helper.js';
import { makeAdminToken, makeClienteToken } from './helpers/auth.helper.js';

const ADMIN_BASE = '/api/admin';

let adminId: string;
let clienteId: string;
let adminToken: string;
let clienteToken: string;

beforeAll(async () => {
  await cleanAll();
  await seedPerfis();
  const admin = await seedAdminUser();
  const cliente = await seedClienteUser('cliente@test.com');
  adminId = admin.id;
  clienteId = cliente.id;
  adminToken = makeAdminToken(adminId, 'admin@test.com');
  clienteToken = makeClienteToken(clienteId, 'cliente@test.com');
});

// ─────────────────────────────────────────────────────────────────────────────
// 10.1 Dashboard
// ─────────────────────────────────────────────────────────────────────────────
describe('Task 10.1 — Admin: Dashboard', () => {
  it('10.1.1 ✅ ADMIN acessa dashboard → 200 com métricas', async () => {
    const res = await request(app)
      .get(`${ADMIN_BASE}/dashboard`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('contadores');
    expect(res.body.data.contadores).toHaveProperty('pendente');
    expect(res.body.data.contadores).toHaveProperty('confirmado');
    expect(res.body.data.contadores).toHaveProperty('concluido');
    expect(res.body.data.contadores).toHaveProperty('cancelado');
  });

  it('10.1.2 ❌ CLIENTE tenta acessar → 403', async () => {
    const res = await request(app)
      .get(`${ADMIN_BASE}/dashboard`)
      .set('Authorization', `Bearer ${clienteToken}`);
    expect(res.status).toBe(403);
  });

  it('10.1.3 ❌ Token ausente → 401', async () => {
    const res = await request(app).get(`${ADMIN_BASE}/dashboard`);
    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 10.2 Listar Usuários
// ─────────────────────────────────────────────────────────────────────────────
describe('Task 10.2 — Admin: Listar Usuários', () => {
  it('10.2.1 ✅ ADMIN lista todos os usuários → 200 array de usuários', async () => {
    const res = await request(app)
      .get(`${ADMIN_BASE}/usuarios`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2); // admin + cliente
  });

  it('10.2.2 ❌ CLIENTE tenta listar → 403', async () => {
    const res = await request(app)
      .get(`${ADMIN_BASE}/usuarios`)
      .set('Authorization', `Bearer ${clienteToken}`);
    expect(res.status).toBe(403);
  });

  it('10.2.3 ❌ Token ausente → 401', async () => {
    const res = await request(app).get(`${ADMIN_BASE}/usuarios`);
    expect(res.status).toBe(401);
  });
});
