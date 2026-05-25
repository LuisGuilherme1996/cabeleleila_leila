import { Agendamento } from '../../../domain/entities/agendamento.entity.js';
import {
  ServicoNaoEncontradoError,
  AgendamentoConflitanteError,
  DomainError,
} from '../../../domain/errors/domain.error.js';
import type { IAgendamentoRepository } from '../../../domain/repositories/i-agendamento.repository.js';
import type { IServicoRepository } from '../../../domain/repositories/i-servico.repository.js';
import type { IHorarioFuncionamentoRepository } from '../../../domain/repositories/i-horario-funcionamento.repository.js';
import type { IBloqueioAgendaRepository } from '../../../domain/repositories/i-bloqueio-agenda.repository.js';
import type { CriarAgendamentoInput, AgendamentoOutput } from '../../dtos/agendamentos/agendamento.dto.js';

export class CriarAgendamentoUseCase {
  constructor(
    private readonly agendamentoRepository: IAgendamentoRepository,
    private readonly servicoRepository: IServicoRepository,
    private readonly horarioRepository: IHorarioFuncionamentoRepository,
    private readonly bloqueioRepository: IBloqueioAgendaRepository,
  ) {}

  async execute(input: CriarAgendamentoInput): Promise<AgendamentoOutput> {
    const servico = await this.servicoRepository.findById(input.servicoId);
    if (!servico || !servico.ativo) {
      throw new ServicoNaoEncontradoError();
    }

    const dataHora = new Date(input.dataHora);
    const diaSemana = dataHora.getDay();
    const horario = await this.horarioRepository.findByDiaSemana(diaSemana);

    if (!horario || horario.fechado) {
      throw new DomainError('Horário fora do funcionamento do salão.', 422);
    }

    const [hIni, mIni] = horario.horaInicio.split(':').map(Number);
    const [hFim, mFim] = horario.horaFim.split(':').map(Number);
    const year = dataHora.getFullYear();
    const month = dataHora.getMonth();
    const day = dataHora.getDate();
    const inicioDia = new Date(year, month, day, hIni!, mIni!, 0, 0);
    const fimDia = new Date(year, month, day, hFim!, mFim!, 0, 0);
    const slotFim = new Date(dataHora.getTime() + servico.duracaoMinutos * 60_000);

    if (dataHora < inicioDia || slotFim > fimDia) {
      throw new DomainError('Horário fora do funcionamento do salão.', 422);
    }

    const bloqueios = await this.bloqueioRepository.findNoPeriodo(dataHora, slotFim);
    if (bloqueios.length > 0) {
      throw new DomainError('Horário está dentro de um período de bloqueio da agenda.', 422);
    }

    const agendamento = Agendamento.create({
      clienteId: input.clienteId,
      servicoId: input.servicoId,
      dataHora,
      observacoes: input.observacoes,
    });

    const result = await this.agendamentoRepository.saveWithConcurrencyCheck(
      agendamento,
      servico.duracaoMinutos,
    );

    if (!result.success) {
      throw new AgendamentoConflitanteError();
    }

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
