import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MEUS_AGENDAMENTOS_ROUTES } from './meus-agendamentos.routing';

@NgModule({
  imports: [RouterModule.forChild(MEUS_AGENDAMENTOS_ROUTES)],
})
export class MeusAgendamentosModule {}
