import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { UserRole } from '../../store/auth.store';
import { AuthStore } from '../../store/auth.store';

/**
 * roleGuard — blocks access when the user's role does not match the
 * required role declared in `route.data['role']`.
 *
 * Usage in route config:
 * ```ts
 * {
 *   path: 'admin',
 *   canActivate: [authGuard, roleGuard],
 *   data: { role: 'ADMIN' },
 *   ...
 * }
 * ```
 *
 * NOTE: Client-side guards are UI-layer only. The API enforces
 * authorisation independently on every request.
 */
export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  const requiredRole = route.data['role'] as UserRole | undefined;

  if (!requiredRole) {
    return true;
  }

  const user = authStore.currentUser();

  if (user?.role === requiredRole) {
    return true;
  }

  // Authenticated but insufficient role → forbidden page
  return router.createUrlTree(['/403']);
};
