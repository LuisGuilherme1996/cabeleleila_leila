import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RESET_PASSWORD_ROUTES } from './reset-password.routing';

@NgModule({
  imports: [RouterModule.forChild(RESET_PASSWORD_ROUTES)],
})
export class ResetPasswordModule {}
