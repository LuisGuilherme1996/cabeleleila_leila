import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ADMIN_HORARIOS_ROUTES } from './admin-horarios.routing';

@NgModule({
  imports: [RouterModule.forChild(ADMIN_HORARIOS_ROUTES)],
})
export class AdminHorariosModule {}
