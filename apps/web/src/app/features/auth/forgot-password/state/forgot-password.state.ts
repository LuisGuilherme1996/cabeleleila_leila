import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ForgotPasswordStep = 'REQUEST_CODE' | 'VERIFY_CODE' | 'RESET_PASSWORD' | 'SUCCESS';

@Injectable()
export class ForgotPasswordState {
  private readonly _loading = new BehaviorSubject<boolean>(false);
  private readonly _error = new BehaviorSubject<string | null>(null);
  private readonly _success = new BehaviorSubject<boolean>(false);
  private readonly _step = new BehaviorSubject<ForgotPasswordStep>('REQUEST_CODE');
  private readonly _email = new BehaviorSubject<string>('');
  private readonly _token = new BehaviorSubject<string>('');

  readonly loading$ = this._loading.asObservable();
  readonly error$ = this._error.asObservable();
  readonly success$ = this._success.asObservable();
  readonly step$ = this._step.asObservable();
  readonly email$ = this._email.asObservable();
  readonly token$ = this._token.asObservable();

  setLoading(v: boolean): void { this._loading.next(v); }
  setError(e: string | null): void { this._error.next(e); }
  setSuccess(v: boolean): void { this._success.next(v); }
  setStep(s: ForgotPasswordStep): void { this._step.next(s); }
  setEmail(e: string): void { this._email.next(e); }
  setToken(t: string): void { this._token.next(t); }
}
