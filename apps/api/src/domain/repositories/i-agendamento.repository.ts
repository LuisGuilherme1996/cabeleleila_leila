import type { Agendamento, StatusAgendamento } from '../entities/agendamento.entity.js';

export interface AgendamentoSlot {
  dataHora: Date;
  duracaoMinutos: number;
}

export interface ListarAgendamentosFilter {
  clienteId?: string;
  status?: StatusAgendamento;
  dataInicio?: Date;
  dataFim?: Date;
  pagina?: number;
  itensPorPagina?: number;
}

export interface DashboardData {
  contadores: {
    pendente: number;
    confirmado: number;
    concluido: number;
    cancelado: number;
  };
  faturamentoEstimado: number;
  proximosAgendamentos: Array<{
    id: string;
    dataHora: Date;
    status: StatusAgendamento;
    clienteNome: string;
    servicoNome: string;
    servicoPreco: number;
  }>;
}

export interface IAgendamentoRepository {
  /** Used by availability calculation in the catalog module. */
  findAgendamentosNoPeriodo(dataInicio: Date, dataFim: Date): Promise<AgendamentoSlot[]>;

  findById(id: string): Promise<Agendamento | null>;

  findMany(filter: ListarAgendamentosFilter): Promise<Agendamento[]>;

  save(agendamento: Agendamento): Promise<void>;

  /**
   * Attempt to insert with a FOR UPDATE lock to prevent double-booking.
   * Returns false if a conflicting appointment already occupies the slot.
   */
  saveWithConcurrencyCheck(
    agendamento: Agendamento,
    duracaoMinutos: number,
  ): Promise<{ success: boolean }>;

  getDashboardData(data: Date): Promise<DashboardData>;
}
