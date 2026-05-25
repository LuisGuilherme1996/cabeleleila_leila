import { inject, Injectable } from '@angular/core';
import { AdminBloqueiosApi } from './api/admin-bloqueios.api';
import { AdminBloqueiosAdapter, BloqueioFormData } from './adapter/admin-bloqueios.adapter';
import { AdminBloqueiosState } from './state/admin-bloqueios.state';
import { ToastService } from '../../../core/services/toast.service';

@Injectable()
export class AdminBloqueiosFacade {
  private readonly api = inject(AdminBloqueiosApi);
  private readonly adapter = inject(AdminBloqueiosAdapter);
  private readonly state = inject(AdminBloqueiosState);
  private readonly toast = inject(ToastService);

  readonly bloqueios$ = this.state.bloqueios$;
  readonly loading$ = this.state.loading$;
  readonly saving$ = this.state.saving$;
  readonly error$ = this.state.error$;

  load(): void {
    this.state.setLoading(true);
    this.state.setError(null);
    this.api.listar().subscribe({
      next: (raw) => {
        this.state.setBloqueios(this.adapter.toUiList(raw));
        this.state.setLoading(false);
      },
      error: (err: Error) => {
        this.state.setError(err.message ?? 'Erro ao carregar bloqueios.');
        this.state.setLoading(false);
      },
    });
  }

  criar(data: BloqueioFormData): void {
    if (data.dataInicio >= data.dataFim) {
      this.toast.error('A data de início deve ser anterior à data de fim.');
      return;
    }
    this.state.setSaving(true);
    const payload: BloqueioFormData = {
      ...data,
      dataInicio: new Date(data.dataInicio).toISOString(),
      dataFim: new Date(data.dataFim).toISOString(),
    };
    this.api.criar(payload).subscribe({
      next: () => {
        this.state.setSaving(false);
        this.toast.success('Bloqueio criado com sucesso!');
        this.load();
      },
      error: (err: Error) => {
        this.state.setSaving(false);
        this.toast.error(err.message ?? 'Erro ao criar bloqueio.');
      },
    });
  }

  remover(id: string): void {
    this.api.remover(id).subscribe({
      next: () => {
        this.toast.success('Bloqueio removido.');
        this.load();
      },
      error: (err: Error) => {
        this.toast.error(err.message ?? 'Erro ao remover bloqueio.');
      },
    });
  }
}
