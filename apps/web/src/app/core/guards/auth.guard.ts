import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../../store/auth.store';

/**
 * authGuard — blocks unauthenticated access.
 * Redirects to /login, preserving the attempted URL as a query param.
 *
 * NOTE: Client-side guards are UI-layer only. The API enforces
 * authorisation independently on every request.
 */
export const authGuard: CanActivateFn = (_route, state) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (authStore.isLoggedIn()) {
    return true;
  }

  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url },
  });
};
