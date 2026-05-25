import { AgendamentoNaoEncontradoError } from '../../../domain/errors/domain.error.js';
import type { IAgendamentoRepository } from '../../../domain/repositories/i-agendamento.repository.js';
import type { AgendamentoOutput } from '../../dtos/agendamentos/agendamento.dto.js';
import type { Agendamento } from '../../../domain/entities/agendamento.entity.js';

export class ConcluirAgendamentoUseCase {
  constructor(private readonly agendamentoRepository: IAgendamentoRepository) {}

  async execute(id: string): Promise<AgendamentoOutput> {
    const agendamento = await this.agendamentoRepository.findById(id);
    if (!agendamento) throw new AgendamentoNaoEncontradoError();

    // State machine validation is enforced inside the entity
    agendamento.concluir();

    await this.agendamentoRepository.save(agendamento);

    return toOutput(agendamento);
  }
}

function toOutput(a: Agendamento): AgendamentoOutput {
  return {
    id: a.id,
    clienteId: a.clienteId,
    servicoId: a.servicoId,
    dataHora: a.dataHora.toISOString(),
    status: a.status,
    observacoes: a.observacoes,
    criadoEm: a.criadoEm.toISOString(),
    atualizadoEm: a.atualizadoEm.toISOString(),
  };
}
