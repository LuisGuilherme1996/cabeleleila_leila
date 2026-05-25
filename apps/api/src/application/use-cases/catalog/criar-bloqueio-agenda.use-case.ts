import { BloqueioAgenda } from '../../../domain/entities/bloqueio-agenda.entity.js';
import type { IBloqueioAgendaRepository } from '../../../domain/repositories/i-bloqueio-agenda.repository.js';
import type { CriarBloqueioAgendaInput, BloqueioAgendaOutput } from '../../dtos/catalog/bloqueio-agenda.dto.js';
import { bloqueioToOutput } from './listar-bloqueios-agenda.use-case.js';
import { DomainError } from '../../../domain/errors/domain.error.js';

export class CriarBloqueioAgendaUseCase {
  constructor(private readonly bloqueioRepository: IBloqueioAgendaRepository) {}

  async execute(input: CriarBloqueioAgendaInput): Promise<BloqueioAgendaOutput> {
    const dataInicio = new Date(input.dataInicio);
    const dataFim = new Date(input.dataFim);

    const conflitos = await this.bloqueioRepository.findNoPeriodo(dataInicio, dataFim);
    if (conflitos.length > 0) {
      throw new DomainError('Já existe um bloqueio de agenda neste período.', 409);
    }

    const bloqueio = BloqueioAgenda.create({ dataInicio, dataFim, motivo: input.motivo });
    await this.bloqueioRepository.save(bloqueio);
    return bloqueioToOutput(bloqueio);
  }
}
