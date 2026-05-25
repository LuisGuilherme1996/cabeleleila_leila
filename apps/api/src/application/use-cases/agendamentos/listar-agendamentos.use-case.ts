import type { IAgendamentoRepository } from '../../../domain/repositories/i-agendamento.repository.js';
import type { IServicoRepository } from '../../../domain/repositories/i-servico.repository.js';
import type {
  AgendamentoOutput,
  ListarAgendamentosQuery,
} from '../../dtos/agendamentos/agendamento.dto.js';
import type { Agendamento } from '../../../domain/entities/agendamento.entity.js';

export class ListarAgendamentosUseCase {
  constructor(
    private readonly agendamentoRepository: IAgendamentoRepository,
    private readonly servicoRepository: IServicoRepository,
  ) {}

  async execute(
    query: ListarAgendamentosQuery,
    /** If provided, restricts results to this client (CLIENTE role). */
    clienteId?: string,
  ): Promise<AgendamentoOutput[]> {
    const dataInicio = query.dataInicio ? parseLocalDate(query.dataInicio, 'start') : undefined;
    const dataFim = query.dataFim ? parseLocalDate(query.dataFim, 'end') : undefined;

    const [agendamentos, servicos] = await Promise.all([
      this.agendamentoRepository.findMany({
        clienteId,
        status: query.status,
        dataInicio,
        dataFim,
        pagina: query.pagina,
        itensPorPagina: query.itensPorPagina,
      }),
      this.servicoRepository.findAll(),
    ]);
    const servicosMap = new Map(servicos.map((s) => [s.id, s]));

    return agendamentos.map((a) => {
      const servico = servicosMap.get(a.servicoId);
      const servicoNome = servico ? servico.nome : 'Serviço Desconhecido';
      const servicoPreco = servico ? servico.preco : 0;
      const servicoDuracao = servico ? servico.duracaoMinutos : 0;

      return {
        id: a.id,
        clienteId: a.clienteId,
        servicoId: a.servicoId,
        servico: {
          id: a.servicoId,
          nome: servicoNome,
          preco: servicoPreco,
          duracaoMinutos: servicoDuracao,
        },
        cliente: {
          id: a.clienteId,
          nome: a.nomeCliente,
          email: a.emailCliente,
        },
        dataHora: a.dataHora.toISOString(),
        status: a.status,
        observacoes: a.observacoes,
        observacao: a.observacoes,
        criadoEm: a.criadoEm.toISOString(),
        atualizadoEm: a.atualizadoEm.toISOString(),
        nomeCliente: a.nomeCliente,
      };
    });
  }
}

function parseLocalDate(dateStr: string, boundary: 'start' | 'end'): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  if (boundary === 'start') return new Date(year, month - 1, day, 0, 0, 0, 0);
  return new Date(year, month - 1, day, 23, 59, 59, 999);
}
