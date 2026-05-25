import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class ResetPasswordState {
  private readonly _loading = new BehaviorSubject<boolean>(false);
  private readonly _error = new BehaviorSubject<string | null>(null);
  private readonly _success = new BehaviorSubject<boolean>(false);

  readonly loading$ = this._loading.asObservable();
  readonly error$ = this._error.asObservable();
  readonly success$ = this._success.asObservable();

  setLoading(v: boolean): void { this._loading.next(v); }
  setError(e: string | null): void { this._error.next(e); }
  setSuccess(v: boolean): void { this._success.next(v); }
}
