import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';
import { BloqueioApiDto, BloqueioFormData } from '../adapter/admin-bloqueios.adapter';

@Injectable({ providedIn: 'root' })
export class AdminBloqueiosApi {
  private readonly api = inject(ApiService);

  listar(): Observable<BloqueioApiDto> {
    return this.api.get<BloqueioApiDto>('/catalog/bloqueios');
  }

  criar(data: BloqueioFormData): Observable<{ status: string; data: unknown }> {
    return this.api.post<{ status: string; data: unknown }>('/catalog/bloqueios', data);
  }

  remover(id: string): Observable<{ status: string; data: unknown }> {
    return this.api.delete<{ status: string; data: unknown }>(`/catalog/bloqueios/${id}`);
  }
}
