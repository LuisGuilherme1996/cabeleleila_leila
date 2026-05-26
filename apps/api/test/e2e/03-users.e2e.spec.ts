/**
 * E2E tests — Users domain.
 *
 * Covers: GET /api/users/me, PATCH /api/users/me
 */
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';
import { cleanAll, seedPerfis, seedClienteUser } from '../helpers/db.helper.js';
import { makeClienteToken, makeExpiredToken } from '../helpers/auth.helper.js';

const agent = request(app);

describe('Users E2E', () => {
  let clienteToken: string;
  let clienteId: string;

  beforeAll(async () => {
    await cleanAll();
    await seedPerfis();

    const cliente = await seedClienteUser();
    clienteId = cliente.id;
    clienteToken = makeClienteToken(clienteId, cliente.email);
  });

  // ── GET /api/users/me ───────────────────────────────────────────────────────
  describe('GET /api/users/me', () => {
    it('deve retornar perfil do usuário autenticado (200)', async () => {
      const res = await agent
        .get('/api/users/me')
        .set('Authorization', `Bearer ${clienteToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('id', clienteId);
      expect(res.body.data).toHaveProperty('nome', 'Cliente Teste');
      expect(res.body.data).toHaveProperty('email', 'cliente@test.com');
      expect(res.body.data).toHaveProperty('emailConfirmado');
      expect(res.body.data.perfis).toContain('CLIENTE');
    });

    it('deve rejeitar sem token de acesso (401)', async () => {
      const res = await agent.get('/api/users/me');

      expect(res.status).toBe(401);
    });

    it('deve rejeitar com token expirado (401)', async () => {
      const expired = makeExpiredToken(clienteId);
      const res = await agent
        .get('/api/users/me')
        .set('Authorization', `Bearer ${expired}`);

      expect(res.status).toBe(401);
    });

    it('deve rejeitar com Bearer inválido (401)', async () => {
      const res = await agent
        .get('/api/users/me')
        .set('Authorization', 'Bearer token-invalido-qualquer');

      expect(res.status).toBe(401);
    });
  });

  // ── PATCH /api/users/me ─────────────────────────────────────────────────────
  describe('PATCH /api/users/me', () => {
    it('deve atualizar nome do usuário (200)', async () => {
      const res = await agent
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${clienteToken}`)
        .send({ nome: 'Novo Nome Cliente' });

      expect(res.status).toBe(200);
      expect(res.body.data.nome).toBe('Novo Nome Cliente');
    });

    it('deve atualizar telefone do usuário (200)', async () => {
      const res = await agent
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${clienteToken}`)
        .send({ telefone: '(21) 98765-4321' });

      expect(res.status).toBe(200);
      expect(res.body.data.telefone).toBe('(21) 98765-4321');
    });

    it('deve atualizar nome e telefone juntos (200)', async () => {
      const res = await agent
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${clienteToken}`)
        .send({ nome: 'Final Name', telefone: '(11) 11111-1111' });

      expect(res.status).toBe(200);
      expect(res.body.data.nome).toBe('Final Name');
      expect(res.body.data.telefone).toBe('(11) 11111-1111');
    });

    it('deve rejeitar sem campos para atualizar (422)', async () => {
      const res = await agent
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${clienteToken}`)
        .send({});

      expect(res.status).toBe(422);
    });

    it('deve rejeitar sem autenticação (401)', async () => {
      const res = await agent
        .patch('/api/users/me')
        .send({ nome: 'Hack' });

      expect(res.status).toBe(401);
    });
  });
});
