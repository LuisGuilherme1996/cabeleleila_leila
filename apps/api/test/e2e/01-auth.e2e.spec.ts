/**
 * E2E tests — Auth domain.
 *
 * Covers: register, login, refresh, logout, forgot-password,
 *         verify-reset-code, reset-password, confirm-email.
 */
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';
import { cleanAll, seedPerfis } from '../helpers/db.helper.js';
import { clearRateLimitKeys } from '../helpers/redis.helper.js';
import { pool } from '../../src/infrastructure/database/pool.js';
import { getRedisClient } from '../../src/infrastructure/cache/redis.client.js';

const agent = request(app);

describe('Auth E2E', () => {
  beforeAll(async () => {
    await cleanAll();
    await seedPerfis();
    await clearRateLimitKeys();
  });

  // ── POST /api/auth/register ─────────────────────────────────────────────────
  describe('POST /api/auth/register', () => {
    beforeEach(async () => {
      await clearRateLimitKeys();
    });

    it('deve registrar usuário com dados válidos (201)', async () => {
      const res = await agent.post('/api/auth/register').send({
        nome: 'Maria Silva',
        email: 'maria@test.com',
        senha: 'Senha@123',
        telefone: '(11) 99999-0001',
      });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.nome).toBe('Maria Silva');
      expect(res.body.data.email).toBe('maria@test.com');
    });

    it('deve rejeitar e-mail duplicado (409)', async () => {
      const res = await agent.post('/api/auth/register').send({
        nome: 'Maria Duplicada',
        email: 'maria@test.com',
        senha: 'Senha@123',
      });

      expect(res.status).toBe(409);
    });

    it('deve rejeitar senha curta (400)', async () => {
      const res = await agent.post('/api/auth/register').send({
        nome: 'Test User',
        email: 'short@test.com',
        senha: '123',
      });

      expect(res.status).toBe(422);
    });

    it('deve rejeitar e-mail inválido (400)', async () => {
      const res = await agent.post('/api/auth/register').send({
        nome: 'Test User',
        email: 'not-an-email',
        senha: 'Senha@123',
      });

      expect(res.status).toBe(422);
    });

    it('deve rejeitar sem nome (400)', async () => {
      const res = await agent.post('/api/auth/register').send({
        email: 'noname@test.com',
        senha: 'Senha@123',
      });

      expect(res.status).toBe(422);
    });
  });

  // ── POST /api/auth/login ────────────────────────────────────────────────────
  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await clearRateLimitKeys();
    });

    it('deve fazer login com credenciais válidas (200)', async () => {
      const res = await agent.post('/api/auth/login').send({
        email: 'maria@test.com',
        senha: 'Senha@123',
      });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data.usuario).toHaveProperty('id');
      expect(res.body.data.usuario.email).toBe('maria@test.com');
      expect(res.body.data.usuario.perfis).toContain('CLIENTE');
      // Cookie should be set
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('deve rejeitar senha errada (401)', async () => {
      const res = await agent.post('/api/auth/login').send({
        email: 'maria@test.com',
        senha: 'SenhaErrada@123',
      });

      expect(res.status).toBe(401);
    });

    it('deve rejeitar e-mail inexistente (401)', async () => {
      const res = await agent.post('/api/auth/login').send({
        email: 'naoexiste@test.com',
        senha: 'Senha@123',
      });

      expect(res.status).toBe(401);
    });
  });

  // ── POST /api/auth/refresh ──────────────────────────────────────────────────
  describe('POST /api/auth/refresh', () => {
    let refreshCookie: string;

    beforeAll(async () => {
      await clearRateLimitKeys();
      const loginRes = await agent.post('/api/auth/login').send({
        email: 'maria@test.com',
        senha: 'Senha@123',
      });
      const cookies = loginRes.headers['set-cookie'] as unknown as string[];
      refreshCookie = cookies.find((c: string) => c.startsWith('refresh-token=')) || '';
    });

    beforeEach(async () => {
      await clearRateLimitKeys();
    });

    it('deve renovar token com cookie válido (200)', async () => {
      const res = await agent
        .post('/api/auth/refresh')
        .set('Cookie', refreshCookie);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('accessToken');
      // Save the new cookie for the revoked test
      const newCookies = res.headers['set-cookie'] as unknown as string[];
      if (newCookies) {
        refreshCookie = newCookies.find((c: string) => c.startsWith('refresh-token=')) || refreshCookie;
      }
    });

    it('deve rejeitar refresh sem cookie (401)', async () => {
      const res = await agent.post('/api/auth/refresh');
      expect(res.status).toBe(401);
    });

    it('deve rejeitar token já revogado (401)', async () => {
      // Login to get a fresh token
      await clearRateLimitKeys();
      const loginRes = await agent.post('/api/auth/login').send({
        email: 'maria@test.com',
        senha: 'Senha@123',
      });
      const cookies = loginRes.headers['set-cookie'] as unknown as string[];
      const cookie = cookies.find((c: string) => c.startsWith('refresh-token=')) || '';

      // Use the refresh token once (this revokes it)
      await clearRateLimitKeys();
      await agent.post('/api/auth/refresh').set('Cookie', cookie);

      // Try to use the same (now revoked) token again
      await clearRateLimitKeys();
      const res = await agent.post('/api/auth/refresh').set('Cookie', cookie);
      expect(res.status).toBe(401);
    });
  });

  // ── POST /api/auth/logout ───────────────────────────────────────────────────
  describe('POST /api/auth/logout', () => {
    it('deve fazer logout com cookie válido (204)', async () => {
      await clearRateLimitKeys();
      const loginRes = await agent.post('/api/auth/login').send({
        email: 'maria@test.com',
        senha: 'Senha@123',
      });
      const cookies = loginRes.headers['set-cookie'] as unknown as string[];
      const cookie = cookies.find((c: string) => c.startsWith('refresh-token=')) || '';

      const res = await agent.post('/api/auth/logout').set('Cookie', cookie);

      expect(res.status).toBe(204);
    });
  });

  // ── POST /api/auth/forgot-password ──────────────────────────────────────────
  describe('POST /api/auth/forgot-password', () => {
    beforeEach(async () => {
      await clearRateLimitKeys();
    });

    it('deve retornar 200 para e-mail existente com debug_token (em test)', async () => {
      const res = await agent.post('/api/auth/forgot-password').send({
        email: 'maria@test.com',
      });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      // In test env, debug_token is exposed
      expect(res.body.debug_token).toBeDefined();
    });

    it('deve retornar 200 para e-mail inexistente (sem vazar informação)', async () => {
      const res = await agent.post('/api/auth/forgot-password').send({
        email: 'inexistente@test.com',
      });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
    });
  });

  // ── POST /api/auth/verify-reset-code ────────────────────────────────────────
  describe('POST /api/auth/verify-reset-code', () => {
    let validCode: string;

    beforeAll(async () => {
      await clearRateLimitKeys();
      const forgotRes = await agent.post('/api/auth/forgot-password').send({
        email: 'maria@test.com',
      });
      validCode = forgotRes.body.debug_token;
    });

    beforeEach(async () => {
      await clearRateLimitKeys();
    });

    it('deve verificar código válido (200)', async () => {
      const res = await agent.post('/api/auth/verify-reset-code').send({
        email: 'maria@test.com',
        code: validCode,
      });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('token');
      // The token is the hex token for reset-password step
      expect(res.body.data.token).toHaveLength(64);
    });

    it('deve rejeitar código errado (400)', async () => {
      // First need a new code since the previous one was consumed
      await clearRateLimitKeys();
      await agent.post('/api/auth/forgot-password').send({
        email: 'maria@test.com',
      });

      const res = await agent.post('/api/auth/verify-reset-code').send({
        email: 'maria@test.com',
        code: '000000',
      });

      expect(res.status).toBe(400);
    });
  });

  // ── POST /api/auth/reset-password ───────────────────────────────────────────
  describe('POST /api/auth/reset-password', () => {
    beforeEach(async () => {
      await clearRateLimitKeys();
    });

    it('deve redefinir senha com token válido (200)', async () => {
      // Full flow: forgot → verify code → reset
      await clearRateLimitKeys();
      const forgotRes = await agent.post('/api/auth/forgot-password').send({
        email: 'maria@test.com',
      });
      const code = forgotRes.body.debug_token;

      await clearRateLimitKeys();
      const verifyRes = await agent.post('/api/auth/verify-reset-code').send({
        email: 'maria@test.com',
        code,
      });
      const resetToken = verifyRes.body.data.token;

      await clearRateLimitKeys();
      const res = await agent.post('/api/auth/reset-password').send({
        token: resetToken,
        novaSenha: 'NovaSenha@456',
      });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');

      // Verify login works with the new password
      await clearRateLimitKeys();
      const loginRes = await agent.post('/api/auth/login').send({
        email: 'maria@test.com',
        senha: 'NovaSenha@456',
      });
      expect(loginRes.status).toBe(200);
    });

    it('deve rejeitar token inválido (400)', async () => {
      const res = await agent.post('/api/auth/reset-password').send({
        token: 'invalid-token-that-does-not-exist',
        novaSenha: 'NovaSenha@789',
      });

      expect(res.status).toBe(400);
    });
  });

  // ── GET /api/auth/confirm-email ─────────────────────────────────────────────
  describe('GET /api/auth/confirm-email', () => {
    it('deve confirmar e-mail com token válido (200)', async () => {
      // Register a new user to get a confirmation token
      await clearRateLimitKeys();
      await agent.post('/api/auth/register').send({
        nome: 'Confirma Test',
        email: 'confirma@test.com',
        senha: 'Senha@123',
      });

      // Fetch the confirmation token from the database
      const tokenResult = await pool.query<{ token: string }>(
        `SELECT ta.token FROM tokens_acao ta
         JOIN usuarios u ON u.id = ta.usuario_id
         WHERE u.email = 'confirma@test.com' AND ta.tipo = 'CONFIRMACAO_EMAIL'
         ORDER BY ta.criado_em DESC LIMIT 1`,
      );

      const token = tokenResult.rows[0]?.token;
      expect(token).toBeDefined();

      const res = await agent
        .get(`/api/auth/confirm-email?token=${token}`)
        .set('Accept', 'application/json');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
    });

    it('deve rejeitar token de confirmação inválido (400)', async () => {
      const res = await agent
        .get('/api/auth/confirm-email?token=invalid-token')
        .set('Accept', 'application/json');

      expect(res.status).toBe(400);
    });
  });
});
