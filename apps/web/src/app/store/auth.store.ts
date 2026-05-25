import { computed, Injectable, signal } from '@angular/core';

export type UserRole = 'ADMIN' | 'CLIENTE';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
}

export interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
}

/**
 * AuthStore — global reactive authentication state.
 *
 * Backed by Angular Signals. The raw writable state is private; consumers
 * receive read-only projections via computed signals.
 *
 * Persistence: accessToken is stored in memory only (refresh token lives in
 * an HttpOnly cookie managed by the backend, per RNF-07).
 */
@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly _state = signal<AuthState>({ user: null, accessToken: null });

  /** Current authenticated user (null when logged out). */
  readonly currentUser = computed(() => this._state().user);

  /** In-memory access token (null when logged out). */
  readonly accessToken = computed(() => this._state().accessToken);

  /** true if a user session is active. */
  readonly isLoggedIn = computed(() => this._state().user !== null);

  /** true if the current user has the ADMIN role. */
  readonly isAdmin = computed(() => this._state().user?.role === 'ADMIN');

  /** true if the current user has the CLIENTE role. */
  readonly isCliente = computed(() => this._state().user?.role === 'CLIENTE');

  /** Hydrate auth state after a successful login or token refresh. */
  setAuth(user: AuthUser, accessToken: string): void {
    localStorage.setItem('accessToken', accessToken);
    this._state.set({ user, accessToken });
  }

  /** Update the access token only (used during token rotation). */
  updateAccessToken(accessToken: string): void {
    this._state.update((s) => ({ ...s, accessToken }));
  }

  /** Clear all auth state (logout / session invalidation). */
  clearAuth(): void {
    localStorage.removeItem('accessToken');
    this._state.set({ user: null, accessToken: null });
  }
}
