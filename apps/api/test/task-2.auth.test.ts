import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { cleanAll, seedPerfis, seedAdminUser, seedClienteUser } from './helpers/db.helper.js';
import { clearRateLimitKeys } from './helpers/redis.helper.js';
import { pool } from '../src/infrastructure/database/pool.js';

const BASE = '/api/auth';

beforeAll(async () => {
  await cleanAll();
  await seedPerfis();
});

afterEach(async () => {
  // Clean user-dependent tables between tests but keep perfis
  await pool.query(`
    TRUNCATE TABLE sessoes_refresh_token, tokens_acao, conexoes_oauth,
                   usuario_perfis, usuarios
    RESTART IDENTITY CASCADE
  `);
});

// ─────────────────────────────────────────────────────────────────────────────
// 2.1 Registro
// ─────────────────────────────────────────────────────────────────────────────
describe('Task 2.1 — Auth: Registro', () => {
  it('2.1.1 ✅ Registrar usuário com dados válidos → 201', async () => {
    const res = await request(app).post(`${BASE}/register`).send({
      nome: 'João Silva',
      email: 'joao@example.com',
      senha: 'Senha@123',
    });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data).toMatchObject({ email: 'joao@example.com' });
  });

  it('2.1.2 ❌ Email já cadastrado → 409', async () => {
    await pool.query(
      `INSERT INTO usuarios (nome, email, senha_hash, email_confirmado) VALUES ('X','dup@example.com','hash',TRUE)`,
    );
    const res = await request(app).post(`${BASE}/register`).send({
      nome: 'Outro',
      email: 'dup@example.com',
      senha: 'Senha@123',
    });
    expect(res.status).toBe(409);
  });

  it('2.1.3 ❌ Email inválido → 422', async () => {
    const res = await request(app).post(`${BASE}/register`).send({
      nome: 'Alguém',
      email: 'nao-e-email',
      senha: 'Senha@123',
    });
    expect(res.status).toBe(422);
  });

  it('2.1.4 ❌ Senha fraca (< 8 chars) → 422', async () => {
    const res = await request(app).post(`${BASE}/register`).send({
      nome: 'Alguém',
      email: 'fraca@example.com',
      senha: '123',
    });
    expect(res.status).toBe(422);
  });

  it('2.1.5 ❌ Campos obrigatórios ausentes → 422', async () => {
    const res = await request(app).post(`${BASE}/register`).send({ email: 'sem@nome.com' });
    expect(res.status).toBe(422);
  });

  it('2.1.6 ❌ Rate limit excedido → 429', async () => {
    await clearRateLimitKeys();
    // Send max+1 requests; invalid payload still counts toward the rate limit
    for (let i = 0; i < 10; i++) {
      await request(app).post(`${BASE}/register`).send({ email: 'bad' });
    }
    const res = await request(app).post(`${BASE}/register`).send({ email: 'bad' });
    expect(res.status).toBe(429);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2.2 Login
// ─────────────────────────────────────────────────────────────────────────────
describe('Task 2.2 — Auth: Login', () => {
  it('2.2.1 ✅ Login com credenciais válidas → 200 accessToken + cookie', async () => {
    await clearRateLimitKeys();
    await seedAdminUser();
    const res = await request(app).post(`${BASE}/login`).send({
      email: 'admin@test.com',
      senha: 'Admin@123',
    });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeTruthy();
    const cookies = res.headers['set-cookie'] as string[];
    expect(cookies?.some((c: string) => c.includes('refresh-token'))).toBe(true);
  });

  it('2.2.2 ❌ Email não cadastrado → 401', async () => {
    await clearRateLimitKeys();
    const res = await request(app).post(`${BASE}/login`).send({
      email: 'notfound@example.com',
      senha: 'Senha@123',
    });
    expect(res.status).toBe(401);
  });

  it('2.2.3 ❌ Senha incorreta → 401', async () => {
    await clearRateLimitKeys();
    await seedAdminUser();
    const res = await request(app).post(`${BASE}/login`).send({
      email: 'admin@test.com',
      senha: 'SenhaErrada',
    });
    expect(res.status).toBe(401);
  });

  it('2.2.4 ❌ Email não confirmado → 403', async () => {
    await clearRateLimitKeys();
    // Insert user with email_confirmado = FALSE
    await pool.query(`
      INSERT INTO usuarios (nome, email, senha_hash, email_confirmado)
      VALUES ('Não Confirmado', 'naoconf@example.com', $1, FALSE)
    `, [await import('argon2').then(a => a.hash('Senha@123', { type: a.argon2id }))]);
    const res = await request(app).post(`${BASE}/login`).send({
      email: 'naoconf@example.com',
      senha: 'Senha@123',
    });
    expect(res.status).toBe(403);
  });

  it('2.2.5 ❌ Payload inválido (email ausente) → 422', async () => {
    await clearRateLimitKeys();
    const res = await request(app).post(`${BASE}/login`).send({ senha: 'Senha@123' });
    expect(res.status).toBe(422);
  });

  it('2.2.6 ❌ Rate limit excedido → 429', async () => {
    await clearRateLimitKeys();
    for (let i = 0; i < 10; i++) {
      await request(app).post(`${BASE}/login`).send({ senha: 'bad' });
    }
    const res = await request(app).post(`${BASE}/login`).send({ senha: 'bad' });
    expect(res.status).toBe(429);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2.3 Refresh Token
// ─────────────────────────────────────────────────────────────────────────────
describe('Task 2.3 — Auth: Refresh Token', () => {
  it('2.3.1 ✅ Cookie refreshToken válido → 200 novo accessToken', async () => {
    await clearRateLimitKeys();
    await seedAdminUser();
    // Login to get the cookie
    const loginRes = await request(app).post(`${BASE}/login`).send({
      email: 'admin@test.com',
      senha: 'Admin@123',
    });
    const cookies = loginRes.headers['set-cookie'] as string[];
    const res = await request(app)
      .post(`${BASE}/refresh`)
      .set('Cookie', cookies);
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeTruthy();
  });

  it('2.3.2 ❌ Cookie ausente → 401', async () => {
    const res = await request(app).post(`${BASE}/refresh`);
    expect(res.status).toBe(401);
  });

  it('2.3.3 ❌ Token revogado (após logout) → 401', async () => {
    await clearRateLimitKeys();
    await seedAdminUser();
    const loginRes = await request(app).post(`${BASE}/login`).send({
      email: 'admin@test.com',
      senha: 'Admin@123',
    });
    const cookies = loginRes.headers['set-cookie'] as string[];
    // Logout first
    await request(app).post(`${BASE}/logout`).set('Cookie', cookies);
    // Try to refresh with revoked token
    const res = await request(app).post(`${BASE}/refresh`).set('Cookie', cookies);
    expect(res.status).toBe(401);
  });

  it('2.3.4 ❌ Token expirado → 401', async () => {
    // Insert an expired refresh token directly
    await seedAdminUser();
    const adminRow = await pool.query<{ id: string }>(
      `SELECT id FROM usuarios WHERE email = 'admin@test.com'`,
    );
    const userId = adminRow.rows[0]!.id;
    const expiredToken = 'expiredtoken123';
    await pool.query(`
      INSERT INTO sessoes_refresh_token (usuario_id, token, expira_em)
      VALUES ($1, $2, NOW() - INTERVAL '1 day')
    `, [userId, expiredToken]);
    const res = await request(app)
      .post(`${BASE}/refresh`)
      .set('Cookie', [`__Host-refresh-token=${expiredToken}`]);
    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2.4 Logout
// ─────────────────────────────────────────────────────────────────────────────
describe('Task 2.4 — Auth: Logout', () => {
  it('2.4.1 ✅ Logout com refreshToken válido → 204', async () => {
    await clearRateLimitKeys();
    await seedAdminUser();
    const loginRes = await request(app).post(`${BASE}/login`).send({
      email: 'admin@test.com',
      senha: 'Admin@123',
    });
    const cookies = loginRes.headers['set-cookie'] as string[];
    const res = await request(app).post(`${BASE}/logout`).set('Cookie', cookies);
    expect(res.status).toBe(204);
  });

  it('2.4.2 ✅ Logout sem cookie (idempotente) → 204', async () => {
    const res = await request(app).post(`${BASE}/logout`);
    expect(res.status).toBe(204);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2.5 Esqueci a Senha
// ─────────────────────────────────────────────────────────────────────────────
describe('Task 2.5 — Auth: Esqueci a Senha', () => {
  it('2.5.1 ✅ Email cadastrado → 200', async () => {
    await clearRateLimitKeys();
    await seedAdminUser();
    const res = await request(app).post(`${BASE}/forgot-password`).send({
      email: 'admin@test.com',
    });
    expect(res.status).toBe(200);
  });

  it('2.5.2 ✅ Email não cadastrado (sem enumeration) → 200', async () => {
    await clearRateLimitKeys();
    const res = await request(app).post(`${BASE}/forgot-password`).send({
      email: 'inexistente@example.com',
    });
    expect(res.status).toBe(200);
  });

  it('2.5.3 ❌ Email inválido → 422', async () => {
    await clearRateLimitKeys();
    const res = await request(app).post(`${BASE}/forgot-password`).send({
      email: 'nao-eh-email',
    });
    expect(res.status).toBe(422);
  });

  it('2.5.4 ❌ Rate limit excedido → 429', async () => {
    await clearRateLimitKeys();
    for (let i = 0; i < 10; i++) {
      await request(app).post(`${BASE}/forgot-password`).send({ email: 'bad' });
    }
    const res = await request(app).post(`${BASE}/forgot-password`).send({ email: 'bad' });
    expect(res.status).toBe(429);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2.6 Redefinir Senha
// ─────────────────────────────────────────────────────────────────────────────
describe('Task 2.6 — Auth: Redefinir Senha', () => {
  async function getResetToken(email: string): Promise<string> {
    await clearRateLimitKeys();
    const res = await request(app).post(`${BASE}/forgot-password`).send({ email });
    const code = res.body.debug_token as string;
    const verifyRes = await request(app).post(`${BASE}/verify-reset-code`).send({ email, code });
    return verifyRes.body.data.token as string;
  }

  it('2.6.1 ✅ Token válido + nova senha forte → 200', async () => {
    await seedAdminUser();
    const token = await getResetToken('admin@test.com');
    const res = await request(app).post(`${BASE}/reset-password`).send({
      token,
      novaSenha: 'NovaSenha@456',
    });
    expect(res.status).toBe(200);
  });

  it('2.6.2 ❌ Token inválido ou adulterado → 400', async () => {
    await clearRateLimitKeys();
    const res = await request(app).post(`${BASE}/reset-password`).send({
      token: 'tokeninvalidoxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      novaSenha: 'NovaSenha@456',
    });
    expect(res.status).toBe(400);
  });

  it('2.6.3 ❌ Token expirado → 400', async () => {
    await seedAdminUser();
    const adminRow = await pool.query<{ id: string }>(
      `SELECT id FROM usuarios WHERE email = 'admin@test.com'`,
    );
    const userId = adminRow.rows[0]!.id;
    const expiredToken = 'expiredresettoken' + Date.now();
    await pool.query(`
      INSERT INTO tokens_acao (usuario_id, token, tipo, expira_em, usado)
      VALUES ($1, $2, 'RECUPERACAO_SENHA', NOW() - INTERVAL '1 hour', FALSE)
    `, [userId, expiredToken]);
    await clearRateLimitKeys();
    const res = await request(app).post(`${BASE}/reset-password`).send({
      token: expiredToken,
      novaSenha: 'NovaSenha@456',
    });
    expect(res.status).toBe(400);
  });

  it('2.6.4 ❌ Nova senha fraca → 422', async () => {
    await clearRateLimitKeys();
    const res = await request(app).post(`${BASE}/reset-password`).send({
      token: 'algumtoken',
      novaSenha: '123',
    });
    expect(res.status).toBe(422);
  });

  it('2.6.5 ❌ Rate limit excedido → 429', async () => {
    await clearRateLimitKeys();
    for (let i = 0; i < 10; i++) {
      await request(app).post(`${BASE}/reset-password`).send({ token: 'x', novaSenha: '123' });
    }
    const res = await request(app)
      .post(`${BASE}/reset-password`)
      .send({ token: 'x', novaSenha: '123' });
    expect(res.status).toBe(429);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2.7 Confirmação de Email
// ─────────────────────────────────────────────────────────────────────────────
describe('Task 2.7 — Auth: Confirmação de Email', () => {
  it('2.7.1 ✅ Token válido → 200 email confirmado', async () => {
    // Register a user (email NOT confirmed)
    await clearRateLimitKeys();
    const regRes = await request(app).post(`${BASE}/register`).send({
      nome: 'Confirmação Teste',
      email: 'confirma@example.com',
      senha: 'Senha@123',
    });
    expect(regRes.status).toBe(201);
    // Get the token from DB
    const tokenRow = await pool.query<{ token: string }>(
      `SELECT t.token FROM tokens_acao t
       JOIN usuarios u ON u.id = t.usuario_id
       WHERE u.email = 'confirma@example.com' AND t.tipo = 'CONFIRMACAO_EMAIL' AND t.usado = FALSE
       LIMIT 1`,
    );
    const token = tokenRow.rows[0]?.token;
    expect(token).toBeTruthy();
    const res = await request(app).get(`${BASE}/confirm-email?token=${token}`);
    expect(res.status).toBe(200);
  });

  it('2.7.2 ❌ Token ausente → 400', async () => {
    const res = await request(app).get(`${BASE}/confirm-email`);
    expect(res.status).toBe(400);
  });

  it('2.7.3 ❌ Token inválido → 400', async () => {
    const res = await request(app).get(`${BASE}/confirm-email?token=tokeninvalido`);
    expect(res.status).toBe(400);
  });

  it('2.7.4 ❌ Token já utilizado → 400', async () => {
    await clearRateLimitKeys();
    const regRes = await request(app).post(`${BASE}/register`).send({
      nome: 'Confirmação Bis',
      email: 'confirma2@example.com',
      senha: 'Senha@123',
    });
    expect(regRes.status).toBe(201);
    const tokenRow = await pool.query<{ token: string }>(
      `SELECT t.token FROM tokens_acao t
       JOIN usuarios u ON u.id = t.usuario_id
       WHERE u.email = 'confirma2@example.com' AND t.tipo = 'CONFIRMACAO_EMAIL'
       LIMIT 1`,
    );
    const token = tokenRow.rows[0]?.token;
    // Use it once
    await request(app).get(`${BASE}/confirm-email?token=${token}`);
    // Use it again
    const res = await request(app).get(`${BASE}/confirm-email?token=${token}`);
    expect(res.status).toBe(400);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2.8 Google OAuth
// ─────────────────────────────────────────────────────────────────────────────
describe('Task 2.8 — Auth: Google OAuth', () => {
  it('2.8.1 ✅ Redirect para Google → 302 (quando configurado) ou 502 (sem config)', async () => {
    const res = await request(app).get(`${BASE}/google`).redirects(0);
    // In test env, GOOGLE_CLIENT_ID is not set → 502 expected
    expect([302, 502]).toContain(res.status);
  });

  it('2.8.3 ❌ Callback com error na query → 400', async () => {
    const res = await request(app).get(`${BASE}/google/callback?error=access_denied`);
    expect(res.status).toBe(400);
  });

  it('2.8.4 ❌ Callback com code inválido → 401 ou 502', async () => {
    const res = await request(app).get(`${BASE}/google/callback?code=invalidcode`);
    expect([401, 502]).toContain(res.status);
  });
});
