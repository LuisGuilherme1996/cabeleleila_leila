import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';

export interface ForgotPasswordRequestDto {
  email: string;
}

export interface ForgotPasswordResponseDto {
  status: string;
  message: string;
}

export interface VerifyResetCodeRequestDto {
  email: string;
  code: string;
}

export interface VerifyResetCodeResponseDto {
  status: string;
  data: {
    token: string;
  };
}

export interface ResetPasswordRequestDto {
  token: string;
  novaSenha: string;
}

export interface ResetPasswordResponseDto {
  status: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ForgotPasswordApi {
  private readonly api = inject(ApiService);

  requestReset(payload: ForgotPasswordRequestDto): Observable<ForgotPasswordResponseDto> {
    return this.api.post<ForgotPasswordResponseDto>('/auth/forgot-password', payload);
  }

  verifyResetCode(payload: VerifyResetCodeRequestDto): Observable<VerifyResetCodeResponseDto> {
    return this.api.post<VerifyResetCodeResponseDto>('/auth/verify-reset-code', payload);
  }

  resetPassword(payload: ResetPasswordRequestDto): Observable<ResetPasswordResponseDto> {
    return this.api.post<ResetPasswordResponseDto>('/auth/reset-password', payload);
  }
}
