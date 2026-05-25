import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PerfilUi } from '../adapter/perfil.adapter';

@Injectable()
export class PerfilState {
  private readonly _loading = new BehaviorSubject<boolean>(false);
  private readonly _saving = new BehaviorSubject<boolean>(false);
  private readonly _error = new BehaviorSubject<string | null>(null);
  private readonly _success = new BehaviorSubject<boolean>(false);
  private readonly _perfil = new BehaviorSubject<PerfilUi | null>(null);

  readonly loading$ = this._loading.asObservable();
  readonly saving$ = this._saving.asObservable();
  readonly error$ = this._error.asObservable();
  readonly success$ = this._success.asObservable();
  readonly perfil$ = this._perfil.asObservable();

  setLoading(v: boolean): void { this._loading.next(v); }
  setSaving(v: boolean): void { this._saving.next(v); }
  setError(e: string | null): void { this._error.next(e); }
  setSuccess(v: boolean): void { this._success.next(v); }
  setPerfil(p: PerfilUi | null): void { this._perfil.next(p); }
}
