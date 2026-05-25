import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ADMIN_AGENDAMENTOS_ROUTES } from './admin-agendamentos.routing';

@NgModule({
  imports: [RouterModule.forChild(ADMIN_AGENDAMENTOS_ROUTES)],
})
export class AdminAgendamentosModule {}
