import { HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthStore } from '../../store/auth.store';
import { ApiService } from '../services/api.service';

/**
 * AuthInterceptor — functional HTTP interceptor.
 *
 * Responsibilities:
 *  1. Attaches `Authorization: Bearer <token>` when a token is present.
 *  2. On 401 response, attempts a single token refresh via POST /auth/refresh.
 *  3. On successful refresh, retries the original request with the new token.
 *  4. On refresh failure, clears auth state and redirects to /login.
 */
export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);
  // We use ApiService directly only for the refresh call; injecting lazily
  // through a factory avoids circular dependency with ApiService itself.
  const apiService = inject(ApiService);

  const token = authStore.accessToken();
  const authorised = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authorised).pipe(
    catchError((error: unknown) => {
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        !req.url.includes('/auth/refresh')
      ) {
        // Attempt token rotation — refresh token is in HttpOnly cookie (auto-sent)
        return apiService
          .post<{ accessToken: string }>('/auth/refresh', {})
          .pipe(
            switchMap(({ accessToken }) => {
              authStore.updateAccessToken(accessToken);
              const retried = req.clone({
                setHeaders: { Authorization: `Bearer ${accessToken}` },
              });
              return next(retried);
            }),
            catchError((refreshError: unknown) => {
              // Refresh failed — invalidate session and force re-login
              authStore.clearAuth();
              router.navigate(['/login']);
              return throwError(() => refreshError);
            }),
          );
      }

      return throwError(() => error);
    }),
  );
};
