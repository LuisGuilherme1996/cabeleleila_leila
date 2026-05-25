import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';
import { HorarioApiDto } from '../adapter/admin-horarios.adapter';

export interface SalvarHorarioPayload {
  diaSemana: number;
  horaInicio: string;
  horaFim: string;
  fechado: boolean;
}

@Injectable({ providedIn: 'root' })
export class AdminHorariosApi {
  private readonly api = inject(ApiService);

  listar(): Observable<HorarioApiDto> {
    return this.api.get<HorarioApiDto>('/catalog/horarios');
  }

  salvar(payload: SalvarHorarioPayload): Observable<{ status: string; data: unknown }> {
    return this.api.put<{ status: string; data: unknown }>('/catalog/horarios', payload);
  }
}
