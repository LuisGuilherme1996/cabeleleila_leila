import {
  AgendamentoNaoEncontradoError,
  AgendamentoAcessoNegadoError,
} from '../../../domain/errors/domain.error.js';
import type { IAgendamentoRepository } from '../../../domain/repositories/i-agendamento.repository.js';
import type { AgendamentoOutput } from '../../dtos/agendamentos/agendamento.dto.js';
import type { Agendamento } from '../../../domain/entities/agendamento.entity.js';

export class CancelarAgendamentoUseCase {
  constructor(private readonly agendamentoRepository: IAgendamentoRepository) {}

  async execute(id: string, usuarioId: string, isAdmin: boolean): Promise<AgendamentoOutput> {
    const agendamento = await this.agendamentoRepository.findById(id);
    if (!agendamento) throw new AgendamentoNaoEncontradoError();

    if (!isAdmin && agendamento.clienteId !== usuarioId) {
      throw new AgendamentoAcessoNegadoError();
    }

    // Domain entity enforces the 2-hour rule for non-admins
    agendamento.cancelar(isAdmin);

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
