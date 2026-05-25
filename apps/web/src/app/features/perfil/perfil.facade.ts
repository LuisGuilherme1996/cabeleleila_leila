import { inject, Injectable } from '@angular/core';
import { PerfilApi, AtualizarPerfilRequestDto } from './api/perfil.api';
import { PerfilAdapter } from './adapter/perfil.adapter';
import { PerfilState } from './state/perfil.state';
import { AuthStore } from '../../store/auth.store';

@Injectable()
export class PerfilFacade {
  private readonly api = inject(PerfilApi);
  private readonly adapter = inject(PerfilAdapter);
  private readonly state = inject(PerfilState);
  private readonly authStore = inject(AuthStore);

  readonly loading$ = this.state.loading$;
  readonly saving$ = this.state.saving$;
  readonly error$ = this.state.error$;
  readonly success$ = this.state.success$;
  readonly perfil$ = this.state.perfil$;

  loadPerfil(): void {
    this.state.setLoading(true);
    this.state.setError(null);
    this.api.getPerfil().subscribe({
      next: (raw) => {
        const perfil = this.adapter.toUi(raw);
        this.state.setPerfil(perfil);
        this.state.setLoading(false);
        // Sync emailVerified into AuthStore so layout reflects confirmed state
        const current = this.authStore.currentUser();
        if (current) {
          this.authStore.setAuth(
            { ...current, emailVerified: perfil.emailConfirmado },
            this.authStore.accessToken() ?? '',
          );
        }
      },
      error: (err: Error) => {
        this.state.setError(err.message ?? 'Erro ao carregar perfil.');
        this.state.setLoading(false);
      },
    });
  }

  savePerfil(payload: AtualizarPerfilRequestDto): void {
    this.state.setSaving(true);
    this.state.setError(null);
    this.state.setSuccess(false);
    this.api.updatePerfil(payload).subscribe({
      next: (raw) => {
        const perfil = this.adapter.toUi(raw);
        this.state.setPerfil(perfil);
        this.state.setSaving(false);
        this.state.setSuccess(true);
        // Sync updated name into AuthStore
        const current = this.authStore.currentUser();
        if (current) {
          this.authStore.setAuth(
            { ...current, name: perfil.nome },
            this.authStore.accessToken() ?? '',
          );
        }
      },
      error: (err: Error) => {
        this.state.setError(err.message ?? 'Erro ao salvar perfil.');
        this.state.setSaving(false);
      },
    });
  }
}
