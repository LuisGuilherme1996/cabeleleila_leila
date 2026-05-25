import { inject, Injectable } from '@angular/core';
import { AdminHorariosApi, SalvarHorarioPayload } from './api/admin-horarios.api';
import { AdminHorariosAdapter } from './adapter/admin-horarios.adapter';
import { AdminHorariosState } from './state/admin-horarios.state';
import { ToastService } from '../../../core/services/toast.service';

@Injectable()
export class AdminHorariosFacade {
  private readonly api = inject(AdminHorariosApi);
  private readonly adapter = inject(AdminHorariosAdapter);
  private readonly state = inject(AdminHorariosState);
  private readonly toast = inject(ToastService);

  readonly horarios$ = this.state.horarios$;
  readonly loading$ = this.state.loading$;
  readonly saving$ = this.state.saving$;
  readonly error$ = this.state.error$;

  load(): void {
    this.state.setLoading(true);
    this.state.setError(null);
    this.api.listar().subscribe({
      next: (raw) => {
        this.state.setHorarios(this.adapter.toUiList(raw));
        this.state.setLoading(false);
      },
      error: (err: Error) => {
        this.state.setError(err.message ?? 'Erro ao carregar horários.');
        this.state.setLoading(false);
      },
    });
  }

  salvarHorario(payload: SalvarHorarioPayload): void {
    this.state.setSaving(true);
    this.api.salvar(payload).subscribe({
      next: () => {
        this.state.setSaving(false);
        this.toast.success('Horário salvo com sucesso!');
        this.load();
      },
      error: (err: Error) => {
        this.state.setSaving(false);
        this.toast.error(err.message ?? 'Erro ao salvar horário.');
      },
    });
  }
}
