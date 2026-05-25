import { Injectable } from '@angular/core';

export interface UsuariosApiDto {
  status: string;
  data: UsuarioItemDto[];
}

export interface UsuarioItemDto {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  perfil: 'ADMIN' | 'CLIENTE';
  emailConfirmado: boolean;
  criadoEm: string;
}

export interface UsuarioUi {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  perfil: 'ADMIN' | 'CLIENTE';
  emailConfirmado: boolean;
}

@Injectable({ providedIn: 'root' })
export class AdminUsuariosAdapter {
  toUiList(raw: UsuariosApiDto): UsuarioUi[] {
    return raw.data.map((u) => ({
      id: u.id,
      nome: u.nome,
      email: u.email,
      telefone: u.telefone,
      perfil: u.perfil,
      emailConfirmado: u.emailConfirmado,
    }));
  }
}
