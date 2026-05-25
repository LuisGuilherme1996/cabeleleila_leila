import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';

export interface GoogleCallbackResponseDto {
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
export class GoogleCallbackApi {
  private readonly api = inject(ApiService);

  /**
   * Exchange the OAuth code (from Google redirect) for tokens.
   * The backend GET /auth/google/callback?code=... handles the exchange
   * and returns the access token + user; the refresh token is set as an
   * HttpOnly cookie automatically.
   */
  exchangeCode(code: string): Observable<GoogleCallbackResponseDto> {
    return this.api.get<GoogleCallbackResponseDto>('/auth/google/callback', { code });
  }
}
