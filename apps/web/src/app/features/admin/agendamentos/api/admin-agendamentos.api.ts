import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';
import { AgendamentoAdminApiDto } from '../adapter/admin-agendamentos.adapter';

@Injectable({ providedIn: 'root' })
export class AdminAgendamentosApi {
  private readonly api = inject(ApiService);

  listar(params?: { status?: string; dataInicio?: string; dataFim?: string }): Observable<AgendamentoAdminApiDto> {
    return this.api.get<AgendamentoAdminApiDto>('/agendamentos', params as Record<string, string>);
  }

  confirmar(id: string): Observable<void> {
    return this.api.patch<void>(`/agendamentos/${id}/confirmar`, {});
  }

  concluir(id: string): Observable<void> {
    return this.api.patch<void>(`/agendamentos/${id}/concluir`, {});
  }

  cancelar(id: string): Observable<void> {
    return this.api.patch<void>(`/agendamentos/${id}/cancelar`, {});
  }
}
