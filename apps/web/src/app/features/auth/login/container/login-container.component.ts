import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LoginFacade } from '../login.facade';
import { LoginState } from '../state/login.state';
import { LoginFormComponent } from '../components/login-form/login-form.component';
import { LoginRequestDto } from '../api/login.api';

@Component({
  selector: 'app-login-container',
  standalone: true,
  templateUrl: './login-container.component.html',
  imports: [AsyncPipe, RouterLink, LoginFormComponent],
  providers: [LoginFacade, LoginState],
})
export class LoginContainerComponent {
  protected readonly facade = inject(LoginFacade);

  readonly loading$ = this.facade.loading$;
  readonly error$ = this.facade.error$;

  protected onLogin(credentials: LoginRequestDto): void {
    this.facade.login(credentials);
  }
}
