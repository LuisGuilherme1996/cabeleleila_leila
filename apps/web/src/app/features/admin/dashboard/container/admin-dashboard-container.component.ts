import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { AdminDashboardFacade } from '../admin-dashboard.facade';
import { AdminDashboardState } from '../state/admin-dashboard.state';
import { DashboardStatsComponent } from '../components/dashboard-stats/dashboard-stats.component';
import { UpcomingAppointmentsComponent } from '../components/upcoming-appointments/upcoming-appointments.component';
import { DashboardRefreshService } from '../../../../core/services/dashboard-refresh.service';

@Component({
  selector: 'app-admin-dashboard-container',
  standalone: true,
  templateUrl: './admin-dashboard-container.component.html',
  imports: [AsyncPipe, DashboardStatsComponent, UpcomingAppointmentsComponent],
  providers: [AdminDashboardFacade, AdminDashboardState],
})
export class AdminDashboardContainerComponent implements OnInit, OnDestroy {
  protected readonly facade = inject(AdminDashboardFacade);
  private readonly dashboardRefresh = inject(DashboardRefreshService);
  private refreshSub?: Subscription;

  readonly stats$ = this.facade.stats$;
  readonly loading$ = this.facade.loading$;
  readonly error$ = this.facade.error$;

  ngOnInit(): void {
    this.facade.loadStats();
    // Recarrega as estatísticas sempre que uma ação admin disparar o evento
    this.refreshSub = this.dashboardRefresh.refresh$.subscribe(() => {
      this.facade.loadStats();
    });
  }

  ngOnDestroy(): void {
    this.refreshSub?.unsubscribe();
  }
}
