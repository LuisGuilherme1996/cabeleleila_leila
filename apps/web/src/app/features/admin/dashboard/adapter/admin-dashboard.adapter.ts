import { Injectable } from '@angular/core';

export type StatusAgendamento = 'PENDENTE' | 'CONFIRMADO' | 'CONCLUIDO' | 'CANCELADO';

export interface ProximoAgendamentoApiDto {
  id: string;
  dataHora: string;
  status: StatusAgendamento;
  clienteNome: string;
  servicoNome: string;
  servicoPreco: number;
}

export interface DashboardStatsApiDto {
  status: string;
  data: {
    contadores: {
      pendente: number;
      confirmado: number;
      concluido: number;
      cancelado: number;
    };
    faturamentoEstimado: number;
    proximosAgendamentos: ProximoAgendamentoApiDto[];
  };
}

export interface ProximoAgendamentoUi {
  id: string;
  dataHoraFormatada: string;
  status: StatusAgendamento;
  clienteNome: string;
  servicoNome: string;
  servicoPreco: number;
}

export interface DashboardStatsUi {
  pendente: number;
  confirmado: number;
  concluido: number;
  cancelado: number;
  faturamentoEstimado: number;
  proximosAgendamentos: ProximoAgendamentoUi[];
}

@Injectable({ providedIn: 'root' })
export class AdminDashboardAdapter {
  toUi(raw: DashboardStatsApiDto): DashboardStatsUi {
    const d = raw.data;
    return {
      pendente: d.contadores.pendente,
      confirmado: d.contadores.confirmado,
      concluido: d.contadores.concluido,
      cancelado: d.contadores.cancelado,
      faturamentoEstimado: d.faturamentoEstimado,
      proximosAgendamentos: d.proximosAgendamentos.map((a) => ({
        id: a.id,
        dataHoraFormatada: new Date(a.dataHora).toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }),
        status: a.status,
        clienteNome: a.clienteNome,
        servicoNome: a.servicoNome,
        servicoPreco: a.servicoPreco,
      })),
    };
  }
}
