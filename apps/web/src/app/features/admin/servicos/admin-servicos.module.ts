import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ADMIN_SERVICOS_ROUTES } from './admin-servicos.routing';

@NgModule({
  imports: [RouterModule.forChild(ADMIN_SERVICOS_ROUTES)],
})
export class AdminServicosModule {}
