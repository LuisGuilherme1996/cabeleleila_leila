import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ADMIN_DASHBOARD_ROUTES } from './admin-dashboard.routing';

@NgModule({
  imports: [RouterModule.forChild(ADMIN_DASHBOARD_ROUTES)],
})
export class AdminDashboardModule {}
