import { inject, Injectable } from '@angular/core';
import { AdminDashboardApi } from './api/admin-dashboard.api';
import { AdminDashboardAdapter } from './adapter/admin-dashboard.adapter';
import { AdminDashboardState } from './state/admin-dashboard.state';

@Injectable()
export class AdminDashboardFacade {
  private readonly api = inject(AdminDashboardApi);
  private readonly adapter = inject(AdminDashboardAdapter);
  private readonly state = inject(AdminDashboardState);

  readonly stats$ = this.state.stats$;
  readonly loading$ = this.state.loading$;
  readonly error$ = this.state.error$;

  loadStats(): void {
    this.state.setLoading(true);
    this.state.setError(null);
    this.api.getStats().subscribe({
      next: (raw) => {
        this.state.setStats(this.adapter.toUi(raw));
        this.state.setLoading(false);
      },
      error: (err: Error) => {
        this.state.setError(err.message ?? 'Erro ao carregar estatísticas.');
        this.state.setLoading(false);
      },
    });
  }
}
