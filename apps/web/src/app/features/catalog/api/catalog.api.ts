import { inject, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ServicoApiDto } from '../adapter/catalog.adapter';

export interface ApiResponse<T> {
  status: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class CatalogApi {
  private readonly api = inject(ApiService);

  getServicos(): Observable<ServicoApiDto[]> {
    return this.api.get<ApiResponse<ServicoApiDto[]>>('/catalog/servicos').pipe(
      map((res) => res.data)
    );
  }
}
