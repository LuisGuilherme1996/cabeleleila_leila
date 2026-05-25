import { inject, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';
import { ServicoApiDto, DisponibilidadeApiDto } from '../adapter/agendar.adapter';

export interface CriarAgendamentoDto {
  servicoId: string;
  dataHora: string; // ISO 8601
  observacoes?: string;
}

export interface AgendamentoApiDto {
  id: string;
  servicoId: string;
  dataHora: string;
  status: string;
}

export interface ApiResponse<T> {
  status: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class AgendarApi {
  private readonly api = inject(ApiService);

  getServicos(): Observable<ServicoApiDto[]> {
    return this.api.get<ApiResponse<ServicoApiDto[]>>('/catalog/servicos').pipe(
      map((res) => res.data)
    );
  }

  getDisponibilidade(data: string, servicoId: string): Observable<DisponibilidadeApiDto> {
    return this.api.get<ApiResponse<DisponibilidadeApiDto>>('/catalog/disponibilidade', {
      data,
      servico_id: servicoId,
    }).pipe(
      map((res) => res.data)
    );
  }

  criarAgendamento(payload: CriarAgendamentoDto): Observable<AgendamentoApiDto> {
    return this.api.post<ApiResponse<AgendamentoApiDto>>('/agendamentos', payload).pipe(
      map((res) => res.data)
    );
  }
}

