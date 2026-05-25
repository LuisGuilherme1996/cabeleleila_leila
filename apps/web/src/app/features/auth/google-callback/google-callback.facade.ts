import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { GoogleCallbackApi } from './api/google-callback.api';
import { AuthStore } from '../../../store/auth.store';

@Injectable()
export class GoogleCallbackFacade {
  private readonly api = inject(GoogleCallbackApi);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  /**
   * Exchanges the Google OAuth code for tokens, populates AuthStore and
   * redirects the user. Credentials never appear in the URL bar since the
   * code is a short-lived, single-use parameter and the access token is
   * stored only in memory.
   */
  handleCallback(code: string): void {
    this.api.exchangeCode(code).subscribe({
      next: (raw) => {
        const { accessToken, usuario } = raw.data;
        const role: 'ADMIN' | 'CLIENTE' = usuario.perfis.includes('ADMIN') ? 'ADMIN' : 'CLIENTE';
        this.authStore.setAuth(
          { id: usuario.id, name: usuario.nome, email: usuario.email, role, emailVerified: true },
          accessToken,
        );
        const destination = role === 'ADMIN' ? '/admin' : '/servicos';
        this.router.navigate([destination]);
      },
      error: () => {
        this.router.navigate(['/login'], { queryParams: { error: 'oauth_failed' } });
      },
    });
  }
}
