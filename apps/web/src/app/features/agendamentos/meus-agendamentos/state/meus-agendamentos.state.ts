import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AgendamentoUi } from '../adapter/meus-agendamentos.adapter';

export type AbaAtiva = 'proximos' | 'historico';

@Injectable()
export class MeusAgendamentosState {
  private readonly _agendamentos = new BehaviorSubject<AgendamentoUi[]>([]);
  private readonly _loading = new BehaviorSubject<boolean>(false);
  private readonly _error = new BehaviorSubject<string | null>(null);
  private readonly _abaAtiva = new BehaviorSubject<AbaAtiva>('proximos');
  private readonly _cancelandoId = new BehaviorSubject<string | null>(null);

  readonly agendamentos$ = this._agendamentos.asObservable();
  readonly loading$ = this._loading.asObservable();
  readonly error$ = this._error.asObservable();
  readonly abaAtiva$ = this._abaAtiva.asObservable();
  readonly cancelandoId$ = this._cancelandoId.asObservable();

  setAgendamentos(a: AgendamentoUi[]): void { this._agendamentos.next(a); }
  setLoading(v: boolean): void { this._loading.next(v); }
  setError(e: string | null): void { this._error.next(e); }
  setAbaAtiva(a: AbaAtiva): void { this._abaAtiva.next(a); }
  setCancelandoId(id: string | null): void { this._cancelandoId.next(id); }
}
