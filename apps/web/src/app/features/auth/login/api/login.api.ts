import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';

export interface LoginRequestDto {
  email: string;
  senha: string;
}

export interface LoginResponseApiDto {
  status: string;
  data: {
    accessToken: string;
    usuario: {
      id: string;
      nome: string;
      email: string;
      perfis: string[];
    };
  };
}

@Injectable({ providedIn: 'root' })
export class LoginApi {
  private readonly api = inject(ApiService);

  login(payload: LoginRequestDto): Observable<LoginResponseApiDto> {
    return this.api.post<LoginResponseApiDto>('/auth/login', payload);
  }
}
