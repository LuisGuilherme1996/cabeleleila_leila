import { Injectable } from '@angular/core';
import { PerfilResponseDto } from '../api/perfil.api';

export interface PerfilUi {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  emailConfirmado: boolean;
  role: 'ADMIN' | 'CLIENTE';
}

@Injectable({ providedIn: 'root' })
export class PerfilAdapter {
  toUi(raw: PerfilResponseDto): PerfilUi {
    return {
      id: raw.data.id,
      nome: raw.data.nome,
      email: raw.data.email,
      telefone: raw.data.telefone,
      emailConfirmado: raw.data.emailConfirmado,
      role: raw.data.perfis.includes('ADMIN') ? 'ADMIN' : 'CLIENTE',
    };
  }
}
