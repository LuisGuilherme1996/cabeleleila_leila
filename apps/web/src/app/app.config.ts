import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  LOCALE_ID,
  APP_INITIALIZER,
} from '@angular/core';
import { HttpClient, provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { routes } from './app.routes';
import { AuthStore } from './store/auth.store';
import { environment } from '../environments/environment';

registerLocaleData(localePt);

function fetchProfile(http: HttpClient, authStore: AuthStore, token: string): Promise<void> {
  return new Promise<void>((resolve) => {
    http.get<{ status: string; data: any }>(
      `${environment.apiUrl}/users/me`,
      { headers: { Authorization: `Bearer ${token}` } }
    ).subscribe({
      next: (profileRes) => {
        const u = profileRes.data;
        if (u) {
          authStore.setAuth({
            id: u.id,
            name: u.nome,
            email: u.email,
            role: u.perfis.includes('ADMIN') ? 'ADMIN' : 'CLIENTE',
            emailVerified: u.emailConfirmado
          }, token);
        }
        resolve();
      },
      error: () => {
        authStore.clearAuth();
        resolve();
      }
    });
  });
}

export function initializeApp(authStore: AuthStore, http: HttpClient) {
  return (): Promise<void> => {
    return new Promise<void>((resolve) => {
      http.post<{ status: string; data: { accessToken: string } }>(
        `${environment.apiUrl}/auth/refresh`,
        {},
        { withCredentials: true }
      ).subscribe({
        next: (res) => {
          const token = res.data?.accessToken;
          if (token) {
            fetchProfile(http, authStore, token).then(resolve);
          } else {
            authStore.clearAuth();
            resolve();
          }
        },
        error: () => {
          // Fallback: try to restore session from the token stored in localStorage
          const storedToken = localStorage.getItem('accessToken');
          if (storedToken) {
            fetchProfile(http, authStore, storedToken).then(resolve);
          } else {
            authStore.clearAuth();
            resolve();
          }
        }
      });
    });
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding(), withViewTransitions()),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [AuthStore, HttpClient],
      multi: true,
    },
  ],
};

