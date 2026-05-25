import type { BloqueioAgenda } from '../entities/bloqueio-agenda.entity.js';

export interface IBloqueioAgendaRepository {
  findAll(): Promise<BloqueioAgenda[]>;
  findById(id: string): Promise<BloqueioAgenda | null>;
  findNoPeriodo(dataInicio: Date, dataFim: Date): Promise<BloqueioAgenda[]>;
  save(bloqueio: BloqueioAgenda): Promise<void>;
  delete(id: string): Promise<void>;
}
