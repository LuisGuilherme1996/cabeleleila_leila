import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';

export interface RegisterRequestDto {
  nome: string;
  email: string;
  senha: string;
  telefone?: string;
}

export interface RegisterResponseApiDto {
  status: string;
  data: {
    id: string;
    nome: string;
    email: string;
  };
}

@Injectable({ providedIn: 'root' })
export class RegisterApi {
  private readonly api = inject(ApiService);

  register(payload: RegisterRequestDto): Observable<RegisterResponseApiDto> {
    return this.api.post<RegisterResponseApiDto>('/auth/register', payload);
  }
}
