import { inject, Injectable } from '@angular/core';
import { AdminAgendamentosApi } from './api/admin-agendamentos.api';
import { AdminAgendamentosAdapter } from './adapter/admin-agendamentos.adapter';
import { AdminAgendamentosState } from './state/admin-agendamentos.state';
import { ToastService } from '../../../core/services/toast.service';
import { DashboardRefreshService } from '../../../core/services/dashboard-refresh.service';

@Injectable()
export class AdminAgendamentosFacade {
  private readonly api = inject(AdminAgendamentosApi);
  private readonly adapter = inject(AdminAgendamentosAdapter);
  private readonly state = inject(AdminAgendamentosState);
  private readonly toast = inject(ToastService);
  private readonly dashboardRefresh = inject(DashboardRefreshService);

  readonly agendamentos$ = this.state.agendamentos$;
  readonly loading$ = this.state.loading$;
  readonly actionLoading$ = this.state.actionLoading$;
  readonly error$ = this.state.error$;
  readonly filtroStatus$ = this.state.filtroStatus$;
  readonly filtroDataInicio$ = this.state.filtroDataInicio$;
  readonly filtroDataFim$ = this.state.filtroDataFim$;

  load(): void {
    this.state.setLoading(true);
    this.state.setError(null);
    this.api.listar(this.state.getFiltros()).subscribe({
      next: (raw) => {
        this.state.setAgendamentos(this.adapter.toUiList(raw));
        this.state.setLoading(false);
      },
      error: (err: Error) => {
        this.state.setError(err.message ?? 'Erro ao carregar agendamentos.');
        this.state.setLoading(false);
      },
    });
  }

  setFiltroStatus(v: string): void {
    this.state.setFiltroStatus(v);
    this.load();
  }

  setFiltroDataInicio(v: string): void {
    this.state.setFiltroDataInicio(v);
    this.load();
  }

  setFiltroDataFim(v: string): void {
    this.state.setFiltroDataFim(v);
    this.load();
  }

  confirmar(id: string): void {
    this.state.setActionLoading(id);
    this.api.confirmar(id).subscribe({
      next: () => {
        this.state.setActionLoading(null);
        this.toast.success('Agendamento confirmado com sucesso!');
        this.load();
      },
      error: (err: Error) => {
        this.state.setActionLoading(null);
        this.toast.error(err.message ?? 'Erro ao confirmar agendamento.');
      },
    });
  }

  concluir(id: string): void {
    this.state.setActionLoading(id);
    this.api.concluir(id).subscribe({
      next: () => {
        this.state.setActionLoading(null);
        this.toast.success('Agendamento concluído com sucesso!');
        this.dashboardRefresh.requestRefresh();
        this.load();
      },
      error: (err: Error) => {
        this.state.setActionLoading(null);
        this.toast.error(err.message ?? 'Erro ao concluir agendamento.');
      },
    });
  }

  cancelar(id: string): void {
    this.state.setActionLoading(id);
    this.api.cancelar(id).subscribe({
      next: () => {
        this.state.setActionLoading(null);
        this.toast.success('Agendamento cancelado com sucesso!');
        this.dashboardRefresh.requestRefresh();
        this.load();
      },
      error: (err: Error) => {
        this.state.setActionLoading(null);
        this.toast.error(err.message ?? 'Erro ao cancelar agendamento.');
      },
    });
  }
}
