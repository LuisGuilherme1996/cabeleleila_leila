import { z } from 'zod';
import type { StatusAgendamento } from '../../../domain/entities/agendamento.entity.js';
import type { DashboardData } from '../../../domain/repositories/i-agendamento.repository.js';

// ── Input Schemas ─────────────────────────────────────────────────────────────

export const criarAgendamentoSchema = z
  .object({
    servicoId: z.string().uuid('ID do serviço inválido.'),
    dataHora: z.string().datetime({ message: 'dataHora deve ser uma data/hora ISO 8601 válida.' }),
    observacoes: z.string().max(500).optional().nullable(),
  })
  .refine(
    (data) => new Date(data.dataHora).getTime() - Date.now() >= 60 * 60 * 1000,
    {
      message: 'Não é possível agendar com menos de 1 hora de antecedência.',
      path: ['dataHora'],
    },
  );

export const listarAgendamentosQuerySchema = z.object({
  status: z
    .enum(['PENDENTE', 'CONFIRMADO', 'CONCLUIDO', 'CANCELADO'])
    .optional(),
  dataInicio: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'dataInicio deve estar no formato YYYY-MM-DD.')
    .optional(),
  dataFim: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'dataFim deve estar no formato YYYY-MM-DD.')
    .optional(),
  pagina: z.coerce.number().int().positive().optional().default(1),
  itensPorPagina: z.coerce.number().int().positive().max(100).optional().default(20),
});

export const agendamentoIdParamSchema = z.object({
  id: z.string().uuid('ID do agendamento inválido.'),
});

// ── Inferred Types ────────────────────────────────────────────────────────────

export type CriarAgendamentoInput = z.infer<typeof criarAgendamentoSchema> & {
  clienteId: string;
};

export type ListarAgendamentosQuery = z.infer<typeof listarAgendamentosQuerySchema>;

// ── Output Types ──────────────────────────────────────────────────────────────

export interface AgendamentoOutput {
  id: string;
  clienteId: string;
  servicoId: string;
  servico?: { id: string; nome: string; preco: number; duracaoMinutos: number };
  cliente?: { id: string; nome: string; email: string };
  dataHora: string;
  status: StatusAgendamento;
  observacoes: string | null;
  observacao?: string | null;
  criadoEm: string;
  atualizadoEm: string;
}

export type DashboardOutput = DashboardData;
