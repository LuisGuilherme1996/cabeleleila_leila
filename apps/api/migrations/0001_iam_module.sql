-- =============================================================
-- Migration: 0001_iam_module.sql
-- Módulo IAM — Tabelas de Identidade e Acesso
-- =============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE tipo_token_acao AS ENUM ('CONFIRMACAO_EMAIL', 'RECUPERACAO_SENHA');

-- -------------------------------------------------------------
-- Tabela: usuarios
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome             VARCHAR(150) NOT NULL,
  email            VARCHAR(150) NOT NULL UNIQUE,
  telefone         VARCHAR(20),
  senha_hash       VARCHAR(255),
  email_confirmado BOOLEAN NOT NULL DEFAULT FALSE,
  criado_em        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -------------------------------------------------------------
-- Tabela: perfis
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS perfis (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome      VARCHAR(50) NOT NULL UNIQUE,
  descricao VARCHAR(255)
);

-- -------------------------------------------------------------
-- Tabela: usuario_perfis (pivot)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuario_perfis (
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  perfil_id  UUID NOT NULL REFERENCES perfis(id) ON DELETE CASCADE,
  PRIMARY KEY (usuario_id, perfil_id)
);

-- -------------------------------------------------------------
-- Tabela: conexoes_oauth
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS conexoes_oauth (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id           UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  provedor             VARCHAR(50) NOT NULL,
  provedor_usuario_id  VARCHAR(255) NOT NULL,
  criado_em            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (provedor, provedor_usuario_id)
);

-- -------------------------------------------------------------
-- Tabela: sessoes_refresh_token
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sessoes_refresh_token (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  token      VARCHAR(500) NOT NULL UNIQUE,
  revogado   BOOLEAN NOT NULL DEFAULT FALSE,
  expira_em  TIMESTAMPTZ NOT NULL,
  criado_em  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sessoes_refresh_token_usuario ON sessoes_refresh_token(usuario_id);

-- -------------------------------------------------------------
-- Tabela: tokens_acao
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tokens_acao (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  token      VARCHAR(255) NOT NULL UNIQUE,
  tipo       tipo_token_acao NOT NULL,
  usado      BOOLEAN NOT NULL DEFAULT FALSE,
  expira_em  TIMESTAMPTZ NOT NULL,
  criado_em  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
