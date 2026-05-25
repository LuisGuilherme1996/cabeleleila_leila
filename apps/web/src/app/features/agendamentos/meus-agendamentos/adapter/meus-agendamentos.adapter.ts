import { Injectable } from '@angular/core';

export interface AgendamentoApiDto {
  id: string;
  servico: { id: string; nome: string; preco: number };
  dataHora: string;
  status: 'PENDENTE' | 'CONFIRMADO' | 'CANCELADO' | 'CONCLUIDO';
  observacao: string | null;
}

export interface AgendamentoUi {
  id: string;
  servicoNome: string;
  servicoPreco: number;
  dataHoraFormatada: string;
  dataHoraRaw: Date;
  status: 'PENDENTE' | 'CONFIRMADO' | 'CANCELADO' | 'CONCLUIDO';
  statusLabel: string;
  observacao: string;
  podeCancelar: boolean;
}

const STATUS_LABEL: Record<AgendamentoUi['status'], string> = {
  PENDENTE: 'Pendente',
  CONFIRMADO: 'Confirmado',
  CANCELADO: 'Cancelado',
  CONCLUIDO: 'Concluído',
};

/** Antecedência mínima de cancelamento: 2 horas */
const MIN_CANCEL_MS = 2 * 60 * 60 * 1000;

@Injectable({ providedIn: 'root' })
export class MeusAgendamentosAdapter {
  toUiList(raw: AgendamentoApiDto[]): AgendamentoUi[] {
    return raw.map((a) => this.toUi(a));
  }

  private toUi(a: AgendamentoApiDto): AgendamentoUi {
    const date = new Date(a.dataHora);
    const dataHoraFormatada = date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const agendamentoAtivo = a.status === 'PENDENTE' || a.status === 'CONFIRMADO';
    const comAntecedencia = date.getTime() - Date.now() > MIN_CANCEL_MS;
    const podeCancelar = agendamentoAtivo && comAntecedencia;

    return {
      id: a.id,
      servicoNome: a.servico.nome,
      servicoPreco: a.servico.preco ?? 0,
      dataHoraFormatada,
      dataHoraRaw: date,
      status: a.status,
      statusLabel: STATUS_LABEL[a.status],
      observacao: a.observacao ?? '',
      podeCancelar,
    };
  }
}
