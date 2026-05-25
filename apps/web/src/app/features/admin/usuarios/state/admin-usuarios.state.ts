import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UsuarioUi } from '../adapter/admin-usuarios.adapter';

@Injectable()
export class AdminUsuariosState {
  private readonly _usuarios = new BehaviorSubject<UsuarioUi[]>([]);
  private readonly _loading = new BehaviorSubject<boolean>(false);
  private readonly _error = new BehaviorSubject<string | null>(null);
  private readonly _busca = new BehaviorSubject<string>('');

  readonly usuarios$ = this._usuarios.asObservable();
  readonly loading$ = this._loading.asObservable();
  readonly error$ = this._error.asObservable();
  readonly busca$ = this._busca.asObservable();

  setUsuarios(v: UsuarioUi[]): void { this._usuarios.next(v); }
  setLoading(v: boolean): void { this._loading.next(v); }
  setError(v: string | null): void { this._error.next(v); }
  setBusca(v: string): void { this._busca.next(v); }
  getBusca(): string { return this._busca.getValue(); }
}
