import { Component, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { DashboardStatsUi } from '../../adapter/admin-dashboard.adapter';

@Component({
  selector: 'app-dashboard-stats',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './dashboard-stats.component.html',
})
export class DashboardStatsComponent {
  readonly stats = input.required<DashboardStatsUi | null>();
}
