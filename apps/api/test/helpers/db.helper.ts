/**
 * Database helper — seed initial data and manage test state.
 */
import * as argon2 from 'argon2';
import { pool } from '../../src/infrastructure/database/pool.js';

export async function seedPerfis(): Promise<void> {
  await pool.query(`
    INSERT INTO perfis (nome, descricao)
    VALUES
      ('ADMIN',   'Administrador do sistema'),
      ('CLIENTE', 'Cliente do salão')
    ON CONFLICT (nome) DO NOTHING
  `);
}

export async function seedAdminUser(): Promise<{ id: string; email: string }> {
  await seedPerfis();
  const senhaHash = await argon2.hash('Admin@123', { type: argon2.argon2id });

  const result = await pool.query<{ id: string }>(
    `
    INSERT INTO usuarios (nome, email, telefone, senha_hash, email_confirmado)
    VALUES ('Leila Admin', 'admin@test.com', '(11) 99999-0001', $1, TRUE)
    ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
    RETURNING id
    `,
    [senhaHash],
  );
  const adminId = result.rows[0]!.id;

  await pool.query(`
    INSERT INTO usuario_perfis (usuario_id, perfil_id)
    SELECT $1, p.id FROM perfis p WHERE p.nome = 'ADMIN'
    ON CONFLICT DO NOTHING
  `, [adminId]);

  return { id: adminId, email: 'admin@test.com' };
}

export async function seedClienteUser(email = 'cliente@test.com'): Promise<{ id: string; email: string }> {
  await seedPerfis();
  const senhaHash = await argon2.hash('Senha@123', { type: argon2.argon2id });

  const result = await pool.query<{ id: string }>(
    `
    INSERT INTO usuarios (nome, email, senha_hash, email_confirmado)
    VALUES ('Cliente Teste', $1, $2, TRUE)
    ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
    RETURNING id
    `,
    [email, senhaHash],
  );
  const clienteId = result.rows[0]!.id;

  await pool.query(`
    INSERT INTO usuario_perfis (usuario_id, perfil_id)
    SELECT $1, p.id FROM perfis p WHERE p.nome = 'CLIENTE'
    ON CONFLICT DO NOTHING
  `, [clienteId]);

  return { id: clienteId, email };
}

export async function seedServicos(): Promise<Array<{ id: string; nome: string }>> {
  const result = await pool.query<{ id: string; nome: string }>(`
    INSERT INTO servicos (nome, descricao, preco, duracao_minutos, ativo)
    VALUES
      ('Corte Feminino',  'Corte e finalização', 80.00,  60, TRUE),
      ('Corte Masculino', 'Corte masculino',      50.00,  30, TRUE)
    ON CONFLICT DO NOTHING
    RETURNING id, nome
  `);
  if (result.rows.length === 0) {
    const existing = await pool.query<{ id: string; nome: string }>(
      `SELECT id, nome FROM servicos WHERE nome IN ('Corte Feminino','Corte Masculino') ORDER BY nome`,
    );
    return existing.rows;
  }
  return result.rows;
}

export async function seedHorariosFuncionamento(): Promise<void> {
  // Monday–Saturday 08:00–18:00, Sunday closed
  for (let dia = 1; dia <= 6; dia++) {
    await pool.query(
      `INSERT INTO horarios_funcionamento (dia_semana, hora_inicio, hora_fim, fechado)
       VALUES ($1, '08:00', '18:00', FALSE)
       ON CONFLICT (dia_semana) DO NOTHING`,
      [dia],
    );
  }
  await pool.query(`
    INSERT INTO horarios_funcionamento (dia_semana, hora_inicio, hora_fim, fechado)
    VALUES (0, '00:00', '00:00', TRUE)
    ON CONFLICT (dia_semana) DO NOTHING
  `);
}

export async function cleanTables(...tables: string[]): Promise<void> {
  if (tables.length === 0) return;
  await pool.query(`TRUNCATE TABLE ${tables.join(', ')} RESTART IDENTITY CASCADE`);
}

export async function cleanAll(): Promise<void> {
  await pool.query(`
    TRUNCATE TABLE
      agendamentos,
      bloqueios_agenda,
      horarios_funcionamento,
      servicos,
      sessoes_refresh_token,
      tokens_acao,
      conexoes_oauth,
      usuario_perfis,
      perfis,
      usuarios
    RESTART IDENTITY CASCADE
  `);
}
