import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PERFIL_ROUTES } from './perfil.routing';

@NgModule({
  imports: [RouterModule.forChild(PERFIL_ROUTES)],
})
export class PerfilModule {}
