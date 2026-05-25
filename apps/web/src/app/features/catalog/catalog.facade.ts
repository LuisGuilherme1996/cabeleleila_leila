import { inject, Injectable } from '@angular/core';
import { CatalogApi } from './api/catalog.api';
import { CatalogAdapter } from './adapter/catalog.adapter';
import { CatalogState } from './state/catalog.state';

@Injectable()
export class CatalogFacade {
  private readonly api = inject(CatalogApi);
  private readonly adapter = inject(CatalogAdapter);
  private readonly state = inject(CatalogState);

  readonly servicos$ = this.state.servicos$;
  readonly loading$ = this.state.loading$;
  readonly error$ = this.state.error$;

  loadServicos(): void {
    this.state.setLoading(true);
    this.state.setError(null);
    this.api.getServicos().subscribe({
      next: (raw) => {
        this.state.setServicos(this.adapter.toUiList(raw));
        this.state.setLoading(false);
      },
      error: (err: Error) => {
        this.state.setError(err.message ?? 'Erro ao carregar serviços.');
        this.state.setLoading(false);
      },
    });
  }
}
