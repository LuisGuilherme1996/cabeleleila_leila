import { Injectable } from '@angular/core';

export type StatusAgendamento = 'PENDENTE' | 'CONFIRMADO' | 'CONCLUIDO' | 'CANCELADO';

export interface AgendamentoAdminApiDto {
  status: string;
  data: AgendamentoAdminItemDto[];
}

export interface AgendamentoAdminItemDto {
  id: string;
  dataHora: string;
  status: StatusAgendamento;
  observacoes: string | null;
  cliente: { id: string; nome: string; email: string };
  servico: { id: string; nome: string; preco: number; duracaoMinutos: number };
  criadoEm: string;
  nomeCliente: string;
}

export interface AgendamentoAdminUi {
  id: string;
  dataHoraFormatada: string;
  dataHoraRaw: Date;
  status: StatusAgendamento;
  statusLabel: string;
  clienteNome: string;
  clienteEmail: string;
  servicoNome: string;
  servicoPreco: number;
  observacoes: string;
}

const STATUS_LABEL: Record<StatusAgendamento, string> = {
  PENDENTE: 'Pendente',
  CONFIRMADO: 'Confirmado',
  CONCLUIDO: 'Concluído',
  CANCELADO: 'Cancelado',
};

@Injectable({ providedIn: 'root' })
export class AdminAgendamentosAdapter {
  toUiList(raw: AgendamentoAdminApiDto): AgendamentoAdminUi[] {
    return raw.data.map((a) => this.toUi(a));
  }

  private toUi(a: AgendamentoAdminItemDto): AgendamentoAdminUi {
    console.log('Adapting agendamento:', a);
    const date = new Date(a.dataHora);
    return {
      id: a.id,
      dataHoraFormatada: date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      dataHoraRaw: date,
      status: a.status,
      statusLabel: STATUS_LABEL[a.status],
      clienteNome: a.cliente?.nome ?? a.nomeCliente,
      clienteEmail: a.cliente?.email ?? '',
      servicoNome: a.servico?.nome ?? '',
      servicoPreco: a.servico?.preco ?? 0,
      observacoes: a.observacoes ?? '',
    };
  }
}
