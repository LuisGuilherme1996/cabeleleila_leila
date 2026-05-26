/**
 * E2E tests — Agendamentos domain.
 *
 * Covers: criar, listar, confirmar, concluir, cancelar,
 *         dashboard admin, listar usuarios admin.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';
import {
  cleanAll,
  seedPerfis,
  seedAdminUser,
  seedClienteUser,
  seedServicos,
  seedHorariosFuncionamento,
} from '../helpers/db.helper.js';
import { clearRateLimitKeys } from '../helpers/redis.helper.js';
import { makeAdminToken, makeClienteToken } from '../helpers/auth.helper.js';

const agent = request(app);

/**
 * Returns a future date on the next available weekday (Mon–Sat)
 * at least `minDaysOut` days in the future, at the given hour.
 */
function nextWeekdayAt(hour: number, minDaysOut = 14): Date {
  const d = new Date();
  d.setDate(d.getDate() + minDaysOut);
  // Shift to Monday if Sunday
  if (d.getDay() === 0) d.setDate(d.getDate() + 1);
  d.setHours(hour, 0, 0, 0);
  return d;
}

describe('Agendamentos E2E', () => {
  let adminToken: string;
  let clienteToken: string;
  let adminId: string;
  let clienteId: string;
  let servicoId: string;
  let agendamentoId: string;

  beforeAll(async () => {
    await cleanAll();
    await seedPerfis();
    await clearRateLimitKeys();
    await seedHorariosFuncionamento();

    const admin = await seedAdminUser();
    const cliente = await seedClienteUser();
    adminId = admin.id;
    clienteId = cliente.id;
    adminToken = makeAdminToken(adminId);
    clienteToken = makeClienteToken(clienteId);

    const servicos = await seedServicos();
    servicoId = servicos[0]!.id;
  });

  // ── POST /api/agendamentos ──────────────────────────────────────────────────
  describe('POST /api/agendamentos', () => {
    it('deve criar agendamento como CLIENTE (201)', async () => {
      const dataHora = nextWeekdayAt(10);

      const res = await agent
        .post('/api/agendamentos')
        .set('Authorization', `Bearer ${clienteToken}`)
        .send({
          servicoId,
          dataHora: dataHora.toISOString(),
          observacoes: 'Primeira vez no salão',
        });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.status).toBe('PENDENTE');
      expect(res.body.data.servicoId).toBe(servicoId);
      agendamentoId = res.body.data.id;
    });

    it('deve rejeitar criação por ADMIN (403)', async () => {
      const dataHora = nextWeekdayAt(11);

      const res = await agent
        .post('/api/agendamentos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          servicoId,
          dataHora: dataHora.toISOString(),
        });

      expect(res.status).toBe(403);
    });

    it('deve rejeitar sem autenticação (401)', async () => {
      const dataHora = nextWeekdayAt(12);

      const res = await agent.post('/api/agendamentos').send({
        servicoId,
        dataHora: dataHora.toISOString(),
      });

      expect(res.status).toBe(401);
    });

    it('deve rejeitar agendamento conflitante no mesmo horário (409)', async () => {
      // Use the same time slot as the already created appointment
      const dataHora = nextWeekdayAt(10);

      const res = await agent
        .post('/api/agendamentos')
        .set('Authorization', `Bearer ${clienteToken}`)
        .send({
          servicoId,
          dataHora: dataHora.toISOString(),
        });

      expect(res.status).toBe(409);
    });

    it('deve rejeitar agendamento em Domingo (fora de funcionamento)', async () => {
      // Find next Sunday
      const d = new Date();
      d.setDate(d.getDate() + 14);
      while (d.getDay() !== 0) d.setDate(d.getDate() + 1);
      d.setHours(10, 0, 0, 0);

      const res = await agent
        .post('/api/agendamentos')
        .set('Authorization', `Bearer ${clienteToken}`)
        .send({
          servicoId,
          dataHora: d.toISOString(),
        });

      expect(res.status).toBe(422);
    });
  });

  // ── GET /api/agendamentos ───────────────────────────────────────────────────
  describe('GET /api/agendamentos', () => {
    it('deve listar agendamentos do CLIENTE (200)', async () => {
      const res = await agent
        .get('/api/agendamentos')
        .set('Authorization', `Bearer ${clienteToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      // Cliente should see only their appointments
      res.body.data.forEach((ag: any) => {
        expect(ag.clienteId).toBe(clienteId);
      });
    });

    it('deve listar todos os agendamentos como ADMIN (200)', async () => {
      const res = await agent
        .get('/api/agendamentos')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('deve filtrar por status (200)', async () => {
      const res = await agent
        .get('/api/agendamentos')
        .query({ status: 'PENDENTE' })
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      res.body.data.forEach((ag: any) => {
        expect(ag.status).toBe('PENDENTE');
      });
    });
  });

  // ── State Machine: confirmar → concluir ─────────────────────────────────────
  describe('Fluxo de Status (State Machine)', () => {
    it('deve confirmar agendamento PENDENTE como ADMIN (200)', async () => {
      const res = await agent
        .patch(`/api/agendamentos/${agendamentoId}/confirmar`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('CONFIRMADO');
    });

    it('deve rejeitar confirmação de agendamento já CONFIRMADO (409)', async () => {
      const res = await agent
        .patch(`/api/agendamentos/${agendamentoId}/confirmar`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(409);
    });

    it('deve rejeitar confirmação por CLIENTE (403)', async () => {
      // Create a new appointment first
      const dataHora = nextWeekdayAt(14);
      const createRes = await agent
        .post('/api/agendamentos')
        .set('Authorization', `Bearer ${clienteToken}`)
        .send({ servicoId, dataHora: dataHora.toISOString() });
      const newId = createRes.body.data.id;

      const res = await agent
        .patch(`/api/agendamentos/${newId}/confirmar`)
        .set('Authorization', `Bearer ${clienteToken}`);

      expect(res.status).toBe(403);
    });

    it('deve concluir agendamento CONFIRMADO como ADMIN (200)', async () => {
      const res = await agent
        .patch(`/api/agendamentos/${agendamentoId}/concluir`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('CONCLUIDO');
    });

    it('deve rejeitar conclusão de agendamento não CONFIRMADO (409)', async () => {
      // Create and try to conclude without confirming
      const dataHora = nextWeekdayAt(15);
      const createRes = await agent
        .post('/api/agendamentos')
        .set('Authorization', `Bearer ${clienteToken}`)
        .send({ servicoId, dataHora: dataHora.toISOString() });
      const newId = createRes.body.data.id;

      const res = await agent
        .patch(`/api/agendamentos/${newId}/concluir`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(409);
    });
  });

  // ── Cancelar ────────────────────────────────────────────────────────────────
  describe('Cancelar Agendamento', () => {
    it('deve permitir ADMIN cancelar agendamento CONFIRMADO (200)', async () => {
      // Create and confirm
      const dataHora = nextWeekdayAt(16);
      const createRes = await agent
        .post('/api/agendamentos')
        .set('Authorization', `Bearer ${clienteToken}`)
        .send({ servicoId, dataHora: dataHora.toISOString() });
      const newId = createRes.body.data.id;

      await agent
        .patch(`/api/agendamentos/${newId}/confirmar`)
        .set('Authorization', `Bearer ${adminToken}`);

      const res = await agent
        .patch(`/api/agendamentos/${newId}/cancelar`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('CANCELADO');
    });

    it('deve permitir CLIENTE cancelar agendamento PENDENTE com antecedência (200)', async () => {
      const dataHora = nextWeekdayAt(9, 21); // 3 weeks out to ensure > 2h
      const createRes = await agent
        .post('/api/agendamentos')
        .set('Authorization', `Bearer ${clienteToken}`)
        .send({ servicoId, dataHora: dataHora.toISOString() });
      const newId = createRes.body.data.id;

      const res = await agent
        .patch(`/api/agendamentos/${newId}/cancelar`)
        .set('Authorization', `Bearer ${clienteToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('CANCELADO');
    });

    it('deve rejeitar cancelamento de agendamento inexistente (404)', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const res = await agent
        .patch(`/api/agendamentos/${fakeId}/cancelar`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });

  // ── Dashboard & Admin ───────────────────────────────────────────────────────
  describe('Dashboard Admin', () => {
    it('deve retornar dados do dashboard como ADMIN (200)', async () => {
      const res = await agent
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('contadores');
      expect(res.body.data.contadores).toHaveProperty('pendente');
      expect(res.body.data.contadores).toHaveProperty('confirmado');
      expect(res.body.data.contadores).toHaveProperty('concluido');
      expect(res.body.data.contadores).toHaveProperty('cancelado');
      expect(res.body.data).toHaveProperty('faturamentoEstimado');
    });

    it('deve rejeitar acesso por CLIENTE (403)', async () => {
      const res = await agent
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${clienteToken}`);

      expect(res.status).toBe(403);
    });

    it('deve rejeitar acesso sem autenticação (401)', async () => {
      const res = await agent.get('/api/admin/dashboard');
      expect(res.status).toBe(401);
    });
  });

  describe('Listar Usuarios Admin', () => {
    it('deve listar usuários como ADMIN (200)', async () => {
      const res = await agent
        .get('/api/admin/usuarios')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2); // admin + cliente
    });

    it('deve rejeitar listagem por CLIENTE (403)', async () => {
      const res = await agent
        .get('/api/admin/usuarios')
        .set('Authorization', `Bearer ${clienteToken}`);

      expect(res.status).toBe(403);
    });
  });
});
