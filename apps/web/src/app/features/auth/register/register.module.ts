import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { REGISTER_ROUTES } from './register.routing';

@NgModule({
  imports: [RouterModule.forChild(REGISTER_ROUTES)],
})
export class RegisterModule {}
