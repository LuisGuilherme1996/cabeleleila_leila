import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FORGOT_PASSWORD_ROUTES } from './forgot-password.routing';

@NgModule({
  imports: [RouterModule.forChild(FORGOT_PASSWORD_ROUTES)],
})
export class ForgotPasswordModule {}
