import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HorarioUi } from '../adapter/admin-horarios.adapter';

@Injectable()
export class AdminHorariosState {
  private readonly _horarios = new BehaviorSubject<HorarioUi[]>([]);
  private readonly _loading = new BehaviorSubject<boolean>(false);
  private readonly _saving = new BehaviorSubject<boolean>(false);
  private readonly _error = new BehaviorSubject<string | null>(null);

  readonly horarios$ = this._horarios.asObservable();
  readonly loading$ = this._loading.asObservable();
  readonly saving$ = this._saving.asObservable();
  readonly error$ = this._error.asObservable();

  setHorarios(v: HorarioUi[]): void { this._horarios.next(v); }
  setLoading(v: boolean): void { this._loading.next(v); }
  setSaving(v: boolean): void { this._saving.next(v); }
  setError(v: string | null): void { this._error.next(v); }
  getHorarios(): HorarioUi[] { return this._horarios.getValue(); }
}
