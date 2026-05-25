import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ADMIN_USUARIOS_ROUTES } from './admin-usuarios.routing';

@NgModule({
  imports: [RouterModule.forChild(ADMIN_USUARIOS_ROUTES)],
})
export class AdminUsuariosModule {}
