import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AgendamentoAdminUi } from '../adapter/admin-agendamentos.adapter';

@Injectable()
export class AdminAgendamentosState {
  private readonly _agendamentos = new BehaviorSubject<AgendamentoAdminUi[]>([]);
  private readonly _loading = new BehaviorSubject<boolean>(false);
  private readonly _actionLoading = new BehaviorSubject<string | null>(null);
  private readonly _error = new BehaviorSubject<string | null>(null);
  private readonly _filtroStatus = new BehaviorSubject<string>('');
  private readonly _filtroDataInicio = new BehaviorSubject<string>('');
  private readonly _filtroDataFim = new BehaviorSubject<string>('');

  readonly agendamentos$ = this._agendamentos.asObservable();
  readonly loading$ = this._loading.asObservable();
  readonly actionLoading$ = this._actionLoading.asObservable();
  readonly error$ = this._error.asObservable();
  readonly filtroStatus$ = this._filtroStatus.asObservable();
  readonly filtroDataInicio$ = this._filtroDataInicio.asObservable();
  readonly filtroDataFim$ = this._filtroDataFim.asObservable();

  setAgendamentos(v: AgendamentoAdminUi[]): void { this._agendamentos.next(v); }
  setLoading(v: boolean): void { this._loading.next(v); }
  setActionLoading(id: string | null): void { this._actionLoading.next(id); }
  setError(v: string | null): void { this._error.next(v); }
  setFiltroStatus(v: string): void { this._filtroStatus.next(v); }
  setFiltroDataInicio(v: string): void { this._filtroDataInicio.next(v); }
  setFiltroDataFim(v: string): void { this._filtroDataFim.next(v); }

  getFiltros(): { status?: string; dataInicio?: string; dataFim?: string } {
    const status = this._filtroStatus.getValue();
    const dataInicio = this._filtroDataInicio.getValue();
    const dataFim = this._filtroDataFim.getValue();
    return {
      ...(status ? { status } : {}),
      ...(dataInicio ? { dataInicio } : {}),
      ...(dataFim ? { dataFim } : {}),
    };
  }
}
