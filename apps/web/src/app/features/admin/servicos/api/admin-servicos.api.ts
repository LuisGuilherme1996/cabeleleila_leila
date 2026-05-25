import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';
import { ServicoApiDto, ServicoFormData } from '../adapter/admin-servicos.adapter';

export interface SingleServicoApiDto {
  status: string;
  data: {
    id: string;
    nome: string;
    descricao: string | null;
    preco: number;
    duracaoMinutos: number;
    ativo: boolean;
    criadoEm: string;
  };
}

@Injectable({ providedIn: 'root' })
export class AdminServicosApi {
  private readonly api = inject(ApiService);

  listar(): Observable<ServicoApiDto> {
    return this.api.get<ServicoApiDto>('/catalog/servicos');
  }

  criar(data: ServicoFormData): Observable<SingleServicoApiDto> {
    return this.api.post<SingleServicoApiDto>('/catalog/servicos', data);
  }

  atualizar(id: string, data: Partial<ServicoFormData>): Observable<SingleServicoApiDto> {
    return this.api.put<SingleServicoApiDto>(`/catalog/servicos/${id}`, data);
  }

  inativar(id: string): Observable<void> {
    return this.api.patch<void>(`/catalog/servicos/${id}/inativar`, {});
  }

  reativar(id: string): Observable<void> {
    return this.api.patch<void>(`/catalog/servicos/${id}/reativar`, {});
  }

  excluir(id: string): Observable<void> {
    return this.api.delete<void>(`/catalog/servicos/${id}`);
  }
}
