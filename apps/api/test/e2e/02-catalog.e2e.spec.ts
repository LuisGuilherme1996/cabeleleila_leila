/**
 * E2E tests — Catalog domain.
 *
 * Covers: servicos CRUD, horários de funcionamento,
 *         bloqueios de agenda, disponibilidade.
 */
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';
import { cleanAll, seedPerfis, seedAdminUser, seedClienteUser, seedHorariosFuncionamento } from '../helpers/db.helper.js';
import { clearRateLimitKeys } from '../helpers/redis.helper.js';
import { makeAdminToken, makeClienteToken } from '../helpers/auth.helper.js';

const agent = request(app);

describe('Catalog E2E', () => {
  let adminToken: string;
  let clienteToken: string;
  let adminId: string;
  let clienteId: string;
  let servicoId: string;

  beforeAll(async () => {
    await cleanAll();
    await seedPerfis();
    await clearRateLimitKeys();

    const admin = await seedAdminUser();
    const cliente = await seedClienteUser();
    adminId = admin.id;
    clienteId = cliente.id;
    adminToken = makeAdminToken(adminId);
    clienteToken = makeClienteToken(clienteId);
  });

  // ── Serviços CRUD ───────────────────────────────────────────────────────────
  describe('Serviços', () => {
    describe('POST /api/catalog/servicos', () => {
      it('deve criar serviço como ADMIN (201)', async () => {
        const res = await agent
          .post('/api/catalog/servicos')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            nome: 'Corte Feminino',
            descricao: 'Corte e finalização profissional',
            preco: 80.0,
            duracaoMinutos: 60,
          });

        expect(res.status).toBe(201);
        expect(res.body.status).toBe('success');
        expect(res.body.data).toHaveProperty('id');
        expect(res.body.data.nome).toBe('Corte Feminino');
        expect(res.body.data.ativo).toBe(true);
        servicoId = res.body.data.id;
      });

      it('deve rejeitar criação por CLIENTE (403)', async () => {
        const res = await agent
          .post('/api/catalog/servicos')
          .set('Authorization', `Bearer ${clienteToken}`)
          .send({
            nome: 'Corte Intruso',
            preco: 50,
            duracaoMinutos: 30,
          });

        expect(res.status).toBe(403);
      });

      it('deve rejeitar criação sem autenticação (401)', async () => {
        const res = await agent.post('/api/catalog/servicos').send({
          nome: 'Corte Anon',
          preco: 50,
          duracaoMinutos: 30,
        });

        expect(res.status).toBe(401);
      });
    });

    describe('GET /api/catalog/servicos', () => {
      it('deve listar serviços como autenticado (200)', async () => {
        const res = await agent
          .get('/api/catalog/servicos')
          .set('Authorization', `Bearer ${clienteToken}`);

        expect(res.status).toBe(200);
        expect(res.body.status).toBe('success');
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      });
    });

    describe('GET /api/catalog/servicos/:id', () => {
      it('deve obter serviço por ID (200)', async () => {
        const res = await agent.get(`/api/catalog/servicos/${servicoId}`);

        expect(res.status).toBe(200);
        expect(res.body.data.id).toBe(servicoId);
        expect(res.body.data.nome).toBe('Corte Feminino');
      });

      it('deve retornar 404 para serviço inexistente', async () => {
        const fakeId = '00000000-0000-0000-0000-000000000000';
        const res = await agent.get(`/api/catalog/servicos/${fakeId}`);

        expect(res.status).toBe(404);
      });
    });

    describe('PUT /api/catalog/servicos/:id', () => {
      it('deve atualizar serviço como ADMIN (200)', async () => {
        const res = await agent
          .put(`/api/catalog/servicos/${servicoId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ preco: 95.0 });

        expect(res.status).toBe(200);
        expect(res.body.data.preco).toBe(95.0);
      });
    });

    describe('PATCH /api/catalog/servicos/:id/inativar', () => {
      it('deve inativar serviço como ADMIN (200)', async () => {
        const res = await agent
          .patch(`/api/catalog/servicos/${servicoId}/inativar`)
          .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data.ativo).toBe(false);
      });
    });

    describe('PATCH /api/catalog/servicos/:id/reativar', () => {
      it('deve reativar serviço como ADMIN (200)', async () => {
        const res = await agent
          .patch(`/api/catalog/servicos/${servicoId}/reativar`)
          .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data.ativo).toBe(true);
      });
    });

    describe('DELETE /api/catalog/servicos/:id', () => {
      it('deve excluir serviço sem agendamentos como ADMIN (200)', async () => {
        // Create a temporary service to delete
        const createRes = await agent
          .post('/api/catalog/servicos')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            nome: 'Serviço Temporário',
            preco: 10,
            duracaoMinutos: 15,
          });
        const tempId = createRes.body.data.id;

        const res = await agent
          .delete(`/api/catalog/servicos/${tempId}`)
          .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(204);
      });
    });
  });

  // ── Horários de Funcionamento ───────────────────────────────────────────────
  describe('Horários de Funcionamento', () => {
    describe('PUT /api/catalog/horarios', () => {
      it('deve salvar horário como ADMIN (200)', async () => {
        const res = await agent
          .put('/api/catalog/horarios')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            diaSemana: 1,
            horaInicio: '08:00',
            horaFim: '18:00',
            fechado: false,
          });

        expect(res.status).toBe(200);
        expect(res.body.data.diaSemana).toBe(1);
        expect(res.body.data.horaInicio).toBe('08:00');
      });

      it('deve rejeitar por CLIENTE (403)', async () => {
        const res = await agent
          .put('/api/catalog/horarios')
          .set('Authorization', `Bearer ${clienteToken}`)
          .send({
            diaSemana: 2,
            horaInicio: '09:00',
            horaFim: '17:00',
          });

        expect(res.status).toBe(403);
      });
    });

    describe('GET /api/catalog/horarios', () => {
      it('deve listar horários como ADMIN (200)', async () => {
        const res = await agent
          .get('/api/catalog/horarios')
          .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
      });

      it('deve rejeitar por CLIENTE (403)', async () => {
        const res = await agent
          .get('/api/catalog/horarios')
          .set('Authorization', `Bearer ${clienteToken}`);

        expect(res.status).toBe(403);
      });
    });
  });

  // ── Bloqueios de Agenda ─────────────────────────────────────────────────────
  describe('Bloqueios de Agenda', () => {
    let bloqueioId: string;

    describe('POST /api/catalog/bloqueios', () => {
      it('deve criar bloqueio como ADMIN (201)', async () => {
        // Schedule block far in the future to pass validation
        const inicio = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const fim = new Date(inicio.getTime() + 4 * 60 * 60 * 1000);

        const res = await agent
          .post('/api/catalog/bloqueios')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            dataInicio: inicio.toISOString(),
            dataFim: fim.toISOString(),
            motivo: 'Manutenção programada',
          });

        expect(res.status).toBe(201);
        expect(res.body.data).toHaveProperty('id');
        expect(res.body.data.motivo).toBe('Manutenção programada');
        bloqueioId = res.body.data.id;
      });

      it('deve rejeitar criação por CLIENTE (403)', async () => {
        const inicio = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
        const fim = new Date(inicio.getTime() + 2 * 60 * 60 * 1000);

        const res = await agent
          .post('/api/catalog/bloqueios')
          .set('Authorization', `Bearer ${clienteToken}`)
          .send({
            dataInicio: inicio.toISOString(),
            dataFim: fim.toISOString(),
            motivo: 'Tentativa indevida',
          });

        expect(res.status).toBe(403);
      });
    });

    describe('GET /api/catalog/bloqueios', () => {
      it('deve listar bloqueios como ADMIN (200)', async () => {
        const res = await agent
          .get('/api/catalog/bloqueios')
          .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      });
    });

    describe('DELETE /api/catalog/bloqueios/:id', () => {
      it('deve remover bloqueio como ADMIN (200)', async () => {
        const res = await agent
          .delete(`/api/catalog/bloqueios/${bloqueioId}`)
          .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(204);
      });

      it('deve retornar 404 para bloqueio inexistente', async () => {
        const fakeId = '00000000-0000-0000-0000-000000000000';
        const res = await agent
          .delete(`/api/catalog/bloqueios/${fakeId}`)
          .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(404);
      });
    });
  });

  // ── Disponibilidade ─────────────────────────────────────────────────────────
  describe('Disponibilidade', () => {
    beforeAll(async () => {
      // Ensure business hours are seeded
      await seedHorariosFuncionamento();
    });

    it('deve listar slots de disponibilidade para dia aberto (200)', async () => {
      // Find next Monday (diaSemana=1) in the future
      const now = new Date();
      const daysUntilMonday = ((1 - now.getDay() + 7) % 7) || 7;
      const nextMonday = new Date(now);
      nextMonday.setDate(now.getDate() + daysUntilMonday + 7); // Two weeks out to be safe
      // Format as YYYY-MM-DD in LOCAL timezone
      const yyyy = nextMonday.getFullYear();
      const mm = String(nextMonday.getMonth() + 1).padStart(2, '0');
      const dd = String(nextMonday.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;

      const res = await agent
        .get('/api/catalog/disponibilidade')
        .query({ data: dateStr, servico_id: servicoId });

      expect(res.status).toBe(200);
      expect(res.body.data.servicoId).toBe(servicoId);
      expect(res.body.data.data).toBe(dateStr);
      expect(Array.isArray(res.body.data.slots)).toBe(true);
      // Monday is open 08:00–18:00, service is 60min
      expect(res.body.data.slots.length).toBeGreaterThan(0);
    });

    it('deve retornar slots vazio para Domingo quando marcado como fechado', async () => {
      // First, explicitly set Sunday as closed via the API
      await agent
        .put('/api/catalog/horarios')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ diaSemana: 0, horaInicio: '00:00', horaFim: '00:00', fechado: true });

      // Find next Sunday in the future (use local date, not UTC)
      const now = new Date();
      const daysUntilSunday = ((0 - now.getDay() + 7) % 7) || 7;
      const nextSunday = new Date(now);
      nextSunday.setDate(now.getDate() + daysUntilSunday + 7);
      // Format as YYYY-MM-DD in LOCAL timezone (not UTC)
      const yyyy = nextSunday.getFullYear();
      const mm = String(nextSunday.getMonth() + 1).padStart(2, '0');
      const dd = String(nextSunday.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;

      const res = await agent
        .get('/api/catalog/disponibilidade')
        .query({ data: dateStr, servico_id: servicoId });

      expect(res.status).toBe(200);
      expect(res.body.data.slots).toEqual([]);
    });

    it('deve retornar 404 para serviço inexistente', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const now = new Date();
      const daysUntilMonday = ((1 - now.getDay() + 7) % 7) || 7;
      const nextMonday = new Date(now);
      nextMonday.setDate(now.getDate() + daysUntilMonday + 7);
      const yyyy = nextMonday.getFullYear();
      const mm = String(nextMonday.getMonth() + 1).padStart(2, '0');
      const dd = String(nextMonday.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;

      const res = await agent
        .get('/api/catalog/disponibilidade')
        .query({ data: dateStr, servico_id: fakeId });

      expect(res.status).toBe(404);
    });
  });
});
