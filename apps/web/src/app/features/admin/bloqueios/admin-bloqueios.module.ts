import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ADMIN_BLOQUEIOS_ROUTES } from './admin-bloqueios.routing';

@NgModule({
  imports: [RouterModule.forChild(ADMIN_BLOQUEIOS_ROUTES)],
})
export class AdminBloqueiosModule {}