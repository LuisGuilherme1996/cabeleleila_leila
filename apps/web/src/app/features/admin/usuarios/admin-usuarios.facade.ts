import { inject, Injectable, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { AdminUsuariosApi } from './api/admin-usuarios.api';
import { AdminUsuariosAdapter } from './adapter/admin-usuarios.adapter';
import { AdminUsuariosState } from './state/admin-usuarios.state';
import { ToastService } from '../../../core/services/toast.service';

@Injectable()
export class AdminUsuariosFacade implements OnDestroy {
  private readonly api = inject(AdminUsuariosApi);
  private readonly adapter = inject(AdminUsuariosAdapter);
  private readonly state = inject(AdminUsuariosState);
  private readonly toast = inject(ToastService);

  readonly usuarios$ = this.state.usuarios$;
  readonly loading$ = this.state.loading$;
  readonly error$ = this.state.error$;
  readonly busca$ = this.state.busca$;

  private readonly buscaSubject = new Subject<string>();
  private readonly sub: Subscription;

  constructor() {
    this.sub = this.buscaSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((busca) => {
        this.state.setLoading(true);
        this.state.setError(null);
        return this.api.listar(busca || undefined);
      }),
    ).subscribe({
      next: (raw) => {
        this.state.setUsuarios(this.adapter.toUiList(raw));
        this.state.setLoading(false);
      },
      error: (err: Error) => {
        this.state.setError(err.message ?? 'Erro ao carregar usuários.');
        this.state.setLoading(false);
        this.toast.error(err.message ?? 'Erro ao carregar usuários.');
      },
    });
  }

  load(): void {
    this.buscaSubject.next(this.state.getBusca());
  }

  setBusca(v: string): void {
    this.state.setBusca(v);
    this.buscaSubject.next(v);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
