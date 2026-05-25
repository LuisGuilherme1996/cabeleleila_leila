import { Component, input, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { AgendamentoAdminUi, StatusAgendamento } from '../../adapter/admin-agendamentos.adapter';
import { ButtonComponent } from 'ui';

const STATUS_CLASS: Record<StatusAgendamento, string> = {
  PENDENTE: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  CONFIRMADO: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  CONCLUIDO: 'bg-slate-500/20 text-slate-400 border border-slate-500/30',
  CANCELADO: 'bg-red-500/20 text-red-400 border border-red-500/30',
};

@Component({
  selector: 'app-agendamentos-table',
  standalone: true,
  imports: [CurrencyPipe, ButtonComponent],
  templateUrl: './agendamentos-table.component.html',
})
export class AgendamentosTableComponent {
  readonly agendamentos = input.required<AgendamentoAdminUi[] | null>();
  readonly loading = input.required<boolean>();
  readonly actionLoading = input.required<string | null>();

  readonly confirmar = output<string>();
  readonly concluir = output<string>();
  readonly cancelar = output<string>();

  statusClass(status: StatusAgendamento): string {
    return STATUS_CLASS[status];
  }

  isLoadingAction(id: string): boolean {
    return this.actionLoading() === id;
  }
}
