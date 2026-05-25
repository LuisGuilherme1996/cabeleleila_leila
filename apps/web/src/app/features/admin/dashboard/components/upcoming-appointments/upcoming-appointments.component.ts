import { Component, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ProximoAgendamentoUi, StatusAgendamento } from '../../adapter/admin-dashboard.adapter';

const STATUS_CLASS: Record<StatusAgendamento, string> = {
  PENDENTE: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  CONFIRMADO: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  CONCLUIDO: 'bg-slate-500/20 text-slate-400 border border-slate-500/30',
  CANCELADO: 'bg-red-500/20 text-red-400 border border-red-500/30',
};

const STATUS_LABEL: Record<StatusAgendamento, string> = {
  PENDENTE: 'Pendente',
  CONFIRMADO: 'Confirmado',
  CONCLUIDO: 'Concluído',
  CANCELADO: 'Cancelado',
};

@Component({
  selector: 'app-upcoming-appointments',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './upcoming-appointments.component.html',
})
export class UpcomingAppointmentsComponent {
  readonly appointments = input.required<ProximoAgendamentoUi[]>();

  statusClass(status: StatusAgendamento): string {
    return STATUS_CLASS[status];
  }

  statusLabel(status: StatusAgendamento): string {
    return STATUS_LABEL[status];
  }
}
