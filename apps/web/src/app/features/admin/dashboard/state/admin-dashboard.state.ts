import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DashboardStatsUi } from '../adapter/admin-dashboard.adapter';

@Injectable()
export class AdminDashboardState {
  private readonly _stats = new BehaviorSubject<DashboardStatsUi | null>(null);
  private readonly _loading = new BehaviorSubject<boolean>(false);
  private readonly _error = new BehaviorSubject<string | null>(null);

  readonly stats$ = this._stats.asObservable();
  readonly loading$ = this._loading.asObservable();
  readonly error$ = this._error.asObservable();

  setStats(s: DashboardStatsUi): void { this._stats.next(s); }
  setLoading(v: boolean): void { this._loading.next(v); }
  setError(e: string | null): void { this._error.next(e); }
}
