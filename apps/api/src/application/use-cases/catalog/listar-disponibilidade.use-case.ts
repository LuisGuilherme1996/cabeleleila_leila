import type { IServicoRepository } from '../../../domain/repositories/i-servico.repository.js';
import type { IHorarioFuncionamentoRepository } from '../../../domain/repositories/i-horario-funcionamento.repository.js';
import type { IBloqueioAgendaRepository } from '../../../domain/repositories/i-bloqueio-agenda.repository.js';
import type { IAgendamentoRepository } from '../../../domain/repositories/i-agendamento.repository.js';
import { ServicoNaoEncontradoError } from '../../../domain/errors/domain.error.js';
import type {
  ListarDisponibilidadeInput,
  DisponibilidadeOutput,
  SlotDisponibilidade,
} from '../../dtos/catalog/disponibilidade.dto.js';

/** Grid interval for slot generation in minutes. */
const GRID_MINUTOS = 30;

export class ListarDisponibilidadeUseCase {
  constructor(
    private readonly servicoRepository: IServicoRepository,
    private readonly horarioRepository: IHorarioFuncionamentoRepository,
    private readonly bloqueioRepository: IBloqueioAgendaRepository,
    private readonly agendamentoRepository: IAgendamentoRepository,
  ) {}

  async execute(input: ListarDisponibilidadeInput): Promise<DisponibilidadeOutput> {
    const servico = await this.servicoRepository.findById(input.servico_id);
    if (!servico) throw new ServicoNaoEncontradoError();

    // Parse date without timezone offset to avoid day drift
    const [year, month, day] = input.data.split('-').map(Number);
    const diaSemana = new Date(year, month - 1, day).getDay(); // 0 = Domingo

    const horario = await this.horarioRepository.findByDiaSemana(diaSemana);

    if (!horario || horario.fechado) {
      return {
        data: input.data,
        servicoId: input.servico_id,
        duracaoMinutos: servico.duracaoMinutos,
        slots: [],
      };
    }

    const [hIni, mIni] = horario.horaInicio.split(':').map(Number);
    const [hFim, mFim] = horario.horaFim.split(':').map(Number);
    const inicioDia = new Date(year, month - 1, day, hIni, mIni, 0, 0);
    const fimDia = new Date(year, month - 1, day, hFim, mFim, 0, 0);

    const [bloqueios, agendamentos] = await Promise.all([
      this.bloqueioRepository.findNoPeriodo(inicioDia, fimDia),
      this.agendamentoRepository.findAgendamentosNoPeriodo(inicioDia, fimDia),
    ]);

    const duracaoMs = servico.duracaoMinutos * 60_000;
    const gridMs = GRID_MINUTOS * 60_000;
    const slots: SlotDisponibilidade[] = [];
    let cursor = inicioDia.getTime();
    // Slots must be bookable at least 1 hour in advance
    const minimoAntecedenciaMs = 60 * 60 * 1000;
    const agora = Date.now();

    while (cursor + duracaoMs <= fimDia.getTime()) {
      const slotInicio = new Date(cursor);
      const slotFim = new Date(cursor + duracaoMs);

      const muitoCedo = slotInicio.getTime() - agora < minimoAntecedenciaMs;

      const bloqueado = bloqueios.some(
        (b) => b.dataInicio < slotFim && b.dataFim > slotInicio,
      );

      const ocupado = agendamentos.some((a) => {
        const aFim = new Date(a.dataHora.getTime() + a.duracaoMinutos * 60_000);
        return a.dataHora < slotFim && aFim > slotInicio;
      });

      const hh = String(slotInicio.getHours()).padStart(2, '0');
      const mm = String(slotInicio.getMinutes()).padStart(2, '0');
      slots.push({ horario: `${hh}:${mm}`, disponivel: !bloqueado && !ocupado && !muitoCedo });

      cursor += gridMs;
    }

    return {
      data: input.data,
      servicoId: input.servico_id,
      duracaoMinutos: servico.duracaoMinutos,
      slots,
    };
  }
}
