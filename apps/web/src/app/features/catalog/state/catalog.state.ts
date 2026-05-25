import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ServicoUi } from '../adapter/catalog.adapter';

@Injectable()
export class CatalogState {
  private readonly _servicos = new BehaviorSubject<ServicoUi[]>([]);
  private readonly _loading = new BehaviorSubject<boolean>(false);
  private readonly _error = new BehaviorSubject<string | null>(null);

  readonly servicos$ = this._servicos.asObservable();
  readonly loading$ = this._loading.asObservable();
  readonly error$ = this._error.asObservable();

  setServicos(s: ServicoUi[]): void {
    this._servicos.next(s);
  }

  setLoading(v: boolean): void {
    this._loading.next(v);
  }

  setError(e: string | null): void {
    this._error.next(e);
  }
}
