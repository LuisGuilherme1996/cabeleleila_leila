import { inject, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';
import { AgendamentoApiDto } from '../adapter/meus-agendamentos.adapter';

export interface ApiResponse<T> {
  status: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class MeusAgendamentosApi {
  private readonly api = inject(ApiService);

  getMeusAgendamentos(): Observable<AgendamentoApiDto[]> {
    return this.api.get<ApiResponse<AgendamentoApiDto[]>>('/agendamentos').pipe(
      map((res) => res.data)
    );
  }

  cancelarAgendamento(id: string): Observable<void> {
    return this.api.patch<ApiResponse<void>>(`/agendamentos/${id}/cancelar`, {}).pipe(
      map((res) => res.data)
    );
  }
}
