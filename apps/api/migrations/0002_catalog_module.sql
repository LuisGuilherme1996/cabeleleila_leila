-- =============================================================
-- Migration: 0002_catalog_module.sql
-- Módulo Catálogo — Tabelas de Serviços e Horários
-- =============================================================

-- -------------------------------------------------------------
-- Tabela: servicos
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS servicos (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome            VARCHAR(100) NOT NULL,
  descricao       TEXT,
  preco           NUMERIC(10, 2) NOT NULL,
  duracao_minutos INTEGER NOT NULL,
  ativo           BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_servicos_ativo ON servicos(ativo);

-- -------------------------------------------------------------
-- Tabela: horarios_funcionamento
-- dia_semana: 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS horarios_funcionamento (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dia_semana  INTEGER NOT NULL UNIQUE,
  hora_inicio VARCHAR(5) NOT NULL,
  hora_fim    VARCHAR(5) NOT NULL,
  fechado     BOOLEAN NOT NULL DEFAULT FALSE
);

-- -------------------------------------------------------------
-- Tabela: bloqueios_agenda
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bloqueios_agenda (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  data_inicio TIMESTAMPTZ NOT NULL,
  data_fim    TIMESTAMPTZ NOT NULL,
  motivo      VARCHAR(255) NOT NULL,
  criado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_bloqueios_agenda_periodo ON bloqueios_agenda(data_inicio, data_fim);
