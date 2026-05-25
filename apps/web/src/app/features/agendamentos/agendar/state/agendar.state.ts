import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ServicoWizardUi, SlotUi } from '../adapter/agendar.adapter';

export type WizardStep = 1 | 2 | 3 | 4 | 'sucesso';

@Injectable()
export class AgendarState {
  private readonly _step = new BehaviorSubject<WizardStep>(1);
  private readonly _servicos = new BehaviorSubject<ServicoWizardUi[]>([]);
  private readonly _servico = new BehaviorSubject<ServicoWizardUi | null>(null);
  private readonly _data = new BehaviorSubject<string | null>(null);
  private readonly _horario = new BehaviorSubject<string | null>(null);
  private readonly _slots = new BehaviorSubject<SlotUi[]>([]);
  private readonly _loading = new BehaviorSubject<boolean>(false);
  private readonly _loadingSlots = new BehaviorSubject<boolean>(false);
  private readonly _submitting = new BehaviorSubject<boolean>(false);
  private readonly _error = new BehaviorSubject<string | null>(null);

  readonly step$ = this._step.asObservable();
  readonly servicos$ = this._servicos.asObservable();
  readonly servico$ = this._servico.asObservable();
  readonly data$ = this._data.asObservable();
  readonly horario$ = this._horario.asObservable();
  readonly slots$ = this._slots.asObservable();
  readonly loading$ = this._loading.asObservable();
  readonly loadingSlots$ = this._loadingSlots.asObservable();
  readonly submitting$ = this._submitting.asObservable();
  readonly error$ = this._error.asObservable();

  get stepSnapshot(): WizardStep { return this._step.getValue(); }

  setStep(s: WizardStep): void { this._step.next(s); }
  setServicos(v: ServicoWizardUi[]): void { this._servicos.next(v); }
  setServico(v: ServicoWizardUi | null): void { this._servico.next(v); }
  setData(v: string | null): void { this._data.next(v); }
  setHorario(v: string | null): void { this._horario.next(v); }
  setSlots(v: SlotUi[]): void { this._slots.next(v); }
  setLoading(v: boolean): void { this._loading.next(v); }
  setLoadingSlots(v: boolean): void { this._loadingSlots.next(v); }
  setSubmitting(v: boolean): void { this._submitting.next(v); }
  setError(e: string | null): void { this._error.next(e); }

  reset(): void {
    this._step.next(1);
    this._servico.next(null);
    this._data.next(null);
    this._horario.next(null);
    this._slots.next([]);
    this._error.next(null);
  }
}
