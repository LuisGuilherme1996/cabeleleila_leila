/**
 * Seed script — Cabeleleila Leila
 *
 * Execução: npx tsx scripts/seed.ts
 *
 * Insere dados iniciais de forma idempotente (INSERT ... ON CONFLICT DO NOTHING).
 */

import * as argon2 from 'argon2';
import { resolve } from 'node:path';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente antes de importar o pool
dotenv.config({ path: resolve(__dirname, '../../.env') });
dotenv.config({ path: resolve(__dirname, '../.env') });

import { pool, query } from '../src/infrastructure/database/pool';

async function seed(): Promise<void> {
  console.log('[seed] Iniciando...');

  // ------------------------------------------------------------------
  // 1. Perfis
  // ------------------------------------------------------------------
  await query(`
    INSERT INTO perfis (nome, descricao)
    VALUES
      ('ADMIN',   'Administrador do sistema'),
      ('CLIENTE', 'Cliente do salão')
    ON CONFLICT (nome) DO NOTHING
  `);
  console.log('[seed] Perfis inseridos.');

  // ------------------------------------------------------------------
  // 2. Usuário administrador inicial
  // ------------------------------------------------------------------
  const senhaHash = await argon2.hash('Admin@123', { type: argon2.argon2id });

  await query(
    `
    INSERT INTO usuarios (nome, email, telefone, senha_hash, email_confirmado)
    VALUES ($1, $2, $3, $4, TRUE)
    ON CONFLICT (email) DO NOTHING
    `,
    ['Leila Admin', 'leila@cabeleleila.com', '(00) 00000-0000', senhaHash],
  );
  console.log('[seed] Usuário administrador inserido.');

  // Vincular perfil ADMIN ao usuário admin
  await query(`
    INSERT INTO usuario_perfis (usuario_id, perfil_id)
    SELECT u.id, p.id
    FROM   usuarios u, perfis p
    WHERE  u.email = 'leila@cabeleleila.com'
      AND  p.nome  = 'ADMIN'
    ON CONFLICT DO NOTHING
  `);
  console.log('[seed] Perfil ADMIN vinculado ao administrador.');

  // ------------------------------------------------------------------
  // 3. Serviços padrão
  // ------------------------------------------------------------------
  await query(`
    INSERT INTO servicos (nome, descricao, preco, duracao_minutos)
    VALUES
      ('Corte Feminino',    'Corte e finalização feminina',              80.00,  60),
      ('Corte Masculino',   'Corte masculino tradicional',               50.00,  30),
      ('Coloração',         'Coloração completa com tintura profissional', 150.00, 90),
      ('Escova Progressiva','Alisamento com escova progressiva',         200.00, 90)
    ON CONFLICT DO NOTHING
  `);
  console.log('[seed] Serviços inseridos.');

  // ------------------------------------------------------------------
  // 4. Grade de funcionamento (Segunda a Sábado, 08:00–18:00)
  // dia_semana: 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
  // ------------------------------------------------------------------
  for (let dia = 1; dia <= 6; dia++) {
    await query(
      `
      INSERT INTO horarios_funcionamento (dia_semana, hora_inicio, hora_fim, fechado)
      VALUES ($1, '08:00', '18:00', FALSE)
      ON CONFLICT (dia_semana) DO NOTHING
      `,
      [dia],
    );
  }
  // Domingo fechado
  await query(`
    INSERT INTO horarios_funcionamento (dia_semana, hora_inicio, hora_fim, fechado)
    VALUES (0, '00:00', '00:00', TRUE)
    ON CONFLICT (dia_semana) DO NOTHING
  `);
  console.log('[seed] Grade de funcionamento inserida.');

  console.log('[seed] Concluído com sucesso!');
}

seed()
  .catch((err) => {
    console.error('[seed] Erro:', err);
    process.exit(1);
  })
  .finally(() => pool.end());
