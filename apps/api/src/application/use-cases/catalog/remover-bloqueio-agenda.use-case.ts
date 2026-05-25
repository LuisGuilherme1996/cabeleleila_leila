import type { IBloqueioAgendaRepository } from '../../../domain/repositories/i-bloqueio-agenda.repository.js';
import { BloqueioAgendaNaoEncontradoError } from '../../../domain/errors/domain.error.js';

export class RemoverBloqueioAgendaUseCase {
  constructor(private readonly bloqueioRepository: IBloqueioAgendaRepository) {}

  async execute(id: string): Promise<void> {
    const bloqueio = await this.bloqueioRepository.findById(id);
    if (!bloqueio) throw new BloqueioAgendaNaoEncontradoError();
    await this.bloqueioRepository.delete(id);
  }
}
