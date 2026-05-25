import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class LoginState {
  private readonly _loading = new BehaviorSubject<boolean>(false);
  private readonly _error = new BehaviorSubject<string | null>(null);

  readonly loading$ = this._loading.asObservable();
  readonly error$ = this._error.asObservable();

  setLoading(v: boolean): void {
    this._loading.next(v);
  }

  setError(e: string | null): void {
    this._error.next(e);
  }
}
