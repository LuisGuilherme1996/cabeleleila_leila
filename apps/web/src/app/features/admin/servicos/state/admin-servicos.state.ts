import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ServicoUi } from '../adapter/admin-servicos.adapter';

@Injectable()
export class AdminServicosState {
  private readonly _servicos = new BehaviorSubject<ServicoUi[]>([]);
  private readonly _loading = new BehaviorSubject<boolean>(false);
  private readonly _saving = new BehaviorSubject<boolean>(false);
  private readonly _error = new BehaviorSubject<string | null>(null);
  private readonly _modalOpen = new BehaviorSubject<boolean>(false);
  private readonly _editingServico = new BehaviorSubject<ServicoUi | null>(null);

  readonly servicos$ = this._servicos.asObservable();
  readonly loading$ = this._loading.asObservable();
  readonly saving$ = this._saving.asObservable();
  readonly error$ = this._error.asObservable();
  readonly modalOpen$ = this._modalOpen.asObservable();
  readonly editingServico$ = this._editingServico.asObservable();

  setServicos(v: ServicoUi[]): void { this._servicos.next(v); }
  setLoading(v: boolean): void { this._loading.next(v); }
  setSaving(v: boolean): void { this._saving.next(v); }
  setError(v: string | null): void { this._error.next(v); }
  openModal(servico: ServicoUi | null): void {
    this._editingServico.next(servico);
    this._modalOpen.next(true);
  }
  closeModal(): void {
    this._modalOpen.next(false);
    this._editingServico.next(null);
  }
}
