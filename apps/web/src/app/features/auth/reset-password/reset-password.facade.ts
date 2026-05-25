import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ResetPasswordApi } from './api/reset-password.api';
import { ResetPasswordState } from './state/reset-password.state';

@Injectable()
export class ResetPasswordFacade {
  private readonly api = inject(ResetPasswordApi);
  private readonly state = inject(ResetPasswordState);
  private readonly router = inject(Router);

  readonly loading$ = this.state.loading$;
  readonly error$ = this.state.error$;
  readonly success$ = this.state.success$;

  resetPassword(token: string, novaSenha: string): void {
    this.state.setLoading(true);
    this.state.setError(null);
    this.api.resetPassword({ token, novaSenha }).subscribe({
      next: () => {
        this.state.setLoading(false);
        this.state.setSuccess(true);
        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      error: (err: Error) => {
        this.state.setError(
          err.message ?? 'Não foi possível redefinir a senha. O link pode ter expirado.',
        );
        this.state.setLoading(false);
      },
    });
  }
}
