import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LoginApi, LoginRequestDto } from './api/login.api';
import { LoginAdapter } from './adapter/login.adapter';
import { LoginState } from './state/login.state';
import { AuthStore } from '../../../store/auth.store';

@Injectable()
export class LoginFacade {
  private readonly api = inject(LoginApi);
  private readonly adapter = inject(LoginAdapter);
  private readonly state = inject(LoginState);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  readonly loading$ = this.state.loading$;
  readonly error$ = this.state.error$;

  login(credentials: LoginRequestDto): void {
    this.state.setLoading(true);
    this.state.setError(null);
    this.api.login(credentials).subscribe({
      next: (raw) => {
        const result = this.adapter.toUi(raw);
        this.authStore.setAuth(result.user, result.accessToken);
        this.state.setLoading(false);
        const destination = result.user.role === 'ADMIN' ? '/admin' : '/servicos';
        this.router.navigate([destination]);
      },
      error: (err: Error) => {
        this.state.setError(err.message ?? 'E-mail ou senha inválidos.');
        this.state.setLoading(false);
      },
    });
  }
}
