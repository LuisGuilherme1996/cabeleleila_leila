-- =============================================================
-- Migration: 0003_appointments_module.sql
-- Módulo Agendamentos — Tabela de Agendamentos
-- =============================================================

CREATE TYPE status_agendamento AS ENUM ('PENDENTE', 'CONFIRMADO', 'CONCLUIDO', 'CANCELADO');

-- -------------------------------------------------------------
-- Tabela: agendamentos
-- cliente_id → ON DELETE CASCADE   (usuário deletado remove seus agendamentos)
-- servico_id → ON DELETE RESTRICT  (impede deleção de serviço com agendamentos)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS agendamentos (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id    UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  servico_id    UUID NOT NULL REFERENCES servicos(id) ON DELETE RESTRICT,
  data_hora     TIMESTAMPTZ NOT NULL,
  status        status_agendamento NOT NULL DEFAULT 'PENDENTE',
  observacoes   TEXT,
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agendamentos_data_status ON agendamentos(data_hora, status);
CREATE INDEX IF NOT EXISTS idx_agendamentos_cliente ON agendamentos(cliente_id);
