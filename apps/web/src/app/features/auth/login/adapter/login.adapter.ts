import { Injectable } from '@angular/core';
import { AuthUser } from '../../../../store/auth.store';
import { LoginResponseApiDto } from '../api/login.api';

export interface LoginResultUi {
  accessToken: string;
  user: AuthUser;
}

@Injectable({ providedIn: 'root' })
export class LoginAdapter {
  toUi(raw: LoginResponseApiDto): LoginResultUi {
    const { accessToken, usuario } = raw.data;
    const role: 'ADMIN' | 'CLIENTE' =
      usuario.perfis.includes('ADMIN') ? 'ADMIN' : 'CLIENTE';
    return {
      accessToken,
      user: {
        id: usuario.id,
        name: usuario.nome,
        email: usuario.email,
        role,
        emailVerified: false, // login endpoint omits emailVerified; profile page reflects real value
      },
    };
  }
}
