import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LOGIN_ROUTES } from './login.routing';

@NgModule({
  imports: [RouterModule.forChild(LOGIN_ROUTES)],
})
export class LoginModule {}
