import { inject, Injectable } from '@angular/core';
import { ForgotPasswordApi } from './api/forgot-password.api';
import { ForgotPasswordState, ForgotPasswordStep } from './state/forgot-password.state';

@Injectable()
export class ForgotPasswordFacade {
  private readonly api = inject(ForgotPasswordApi);
  private readonly state = inject(ForgotPasswordState);

  readonly loading$ = this.state.loading$;
  readonly error$ = this.state.error$;
  readonly success$ = this.state.success$;
  readonly step$ = this.state.step$;
  readonly email$ = this.state.email$;
  readonly token$ = this.state.token$;

  requestReset(email: string): void {
    this.state.setLoading(true);
    this.state.setError(null);
    this.state.setEmail(email);
    this.api.requestReset({ email }).subscribe({
      next: () => {
        this.state.setLoading(false);
        this.state.setStep('VERIFY_CODE');
      },
      error: (err: any) => {
        this.state.setError(err.error?.message || err.message || 'Erro ao solicitar código de redefinição.');
        this.state.setLoading(false);
      },
    });
  }

  verifyResetCode(code: string): void {
    this.state.setLoading(true);
    this.state.setError(null);
    let currentEmail = '';
    this.email$.subscribe(email => currentEmail = email).unsubscribe();

    this.api.verifyResetCode({ email: currentEmail, code }).subscribe({
      next: (res) => {
        this.state.setLoading(false);
        this.state.setToken(res.data.token);
        this.state.setStep('RESET_PASSWORD');
      },
      error: (err: any) => {
        this.state.setError(err.error?.message || err.message || 'Código inválido ou expirado.');
        this.state.setLoading(false);
      },
    });
  }

  resetPassword(novaSenha: string): void {
    this.state.setLoading(true);
    this.state.setError(null);
    let currentToken = '';
    this.token$.subscribe(token => currentToken = token).unsubscribe();

    this.api.resetPassword({ token: currentToken, novaSenha }).subscribe({
      next: () => {
        this.state.setLoading(false);
        this.state.setStep('SUCCESS');
      },
      error: (err: any) => {
        this.state.setError(err.error?.message || err.message || 'Não foi possível redefinir a senha.');
        this.state.setLoading(false);
      },
    });
  }

  resetToFirstStep(): void {
    this.state.setError(null);
    this.state.setLoading(false);
    this.state.setStep('REQUEST_CODE');
  }
}
