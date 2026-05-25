import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

export interface PerfilResponseDto {
  status: string;
  data: {
    id: string;
    nome: string;
    email: string;
    telefone: string | null;
    emailConfirmado: boolean;
    perfis: string[];
  };
}

export interface AtualizarPerfilRequestDto {
  nome?: string;
  telefone?: string | null;
}

@Injectable({ providedIn: 'root' })
export class PerfilApi {
  private readonly api = inject(ApiService);

  getPerfil(): Observable<PerfilResponseDto> {
    return this.api.get<PerfilResponseDto>('/users/me');
  }

  updatePerfil(payload: AtualizarPerfilRequestDto): Observable<PerfilResponseDto> {
    return this.api.patch<PerfilResponseDto>('/users/me', payload);
  }
}
