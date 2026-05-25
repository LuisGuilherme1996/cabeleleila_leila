import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';

export interface ResetPasswordRequestDto {
  token: string;
  novaSenha: string;
}

export interface ResetPasswordResponseDto {
  status: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ResetPasswordApi {
  private readonly api = inject(ApiService);

  resetPassword(payload: ResetPasswordRequestDto): Observable<ResetPasswordResponseDto> {
    return this.api.post<ResetPasswordResponseDto>('/auth/reset-password', payload);
  }
}
