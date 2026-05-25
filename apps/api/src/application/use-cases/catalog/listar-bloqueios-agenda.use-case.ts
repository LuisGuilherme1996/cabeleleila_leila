import type { IBloqueioAgendaRepository } from '../../../domain/repositories/i-bloqueio-agenda.repository.js';
import type { BloqueioAgenda } from '../../../domain/entities/bloqueio-agenda.entity.js';
import type { BloqueioAgendaOutput } from '../../dtos/catalog/bloqueio-agenda.dto.js';

export function bloqueioToOutput(bloqueio: BloqueioAgenda): BloqueioAgendaOutput {
  return {
    id: bloqueio.id,
    dataInicio: bloqueio.dataInicio,
    dataFim: bloqueio.dataFim,
    motivo: bloqueio.motivo,
    criadoEm: bloqueio.criadoEm,
  };
}

export class ListarBloqueiosAgendaUseCase {
  constructor(private readonly bloqueioRepository: IBloqueioAgendaRepository) {}

  async execute(): Promise<BloqueioAgendaOutput[]> {
    const bloqueios = await this.bloqueioRepository.findAll();
    return bloqueios.map(bloqueioToOutput);
  }
}
