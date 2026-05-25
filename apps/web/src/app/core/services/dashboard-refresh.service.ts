import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * Lightweight event bus used to trigger a dashboard stats reload
 * whenever the admin performs a booking action (concluir / cancelar).
 */
@Injectable({ providedIn: 'root' })
export class DashboardRefreshService {
  private readonly _refresh$ = new Subject<void>();

  /** Emits whenever the dashboard should re-fetch its data. */
  readonly refresh$ = this._refresh$.asObservable();

  requestRefresh(): void {
    this._refresh$.next();
  }
}
