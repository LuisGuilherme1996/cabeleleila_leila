import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BloqueioUi } from '../adapter/admin-bloqueios.adapter';

@Injectable()
export class AdminBloqueiosState {
  private readonly _bloqueios = new BehaviorSubject<BloqueioUi[]>([]);
  private readonly _loading = new BehaviorSubject<boolean>(false);
  private readonly _saving = new BehaviorSubject<boolean>(false);
  private readonly _error = new BehaviorSubject<string | null>(null);

  readonly bloqueios$ = this._bloqueios.asObservable();
  readonly loading$ = this._loading.asObservable();
  readonly saving$ = this._saving.asObservable();
  readonly error$ = this._error.asObservable();

  setBloqueios(v: BloqueioUi[]): void { this._bloqueios.next(v); }
  setLoading(v: boolean): void { this._loading.next(v); }
  setSaving(v: boolean): void { this._saving.next(v); }
  setError(v: string | null): void { this._error.next(v); }
}
