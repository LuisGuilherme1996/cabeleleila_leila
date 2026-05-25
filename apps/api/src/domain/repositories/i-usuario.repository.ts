import type { Usuario } from '../entities/usuario.entity.js';

export interface UsuarioComPerfil {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  perfil: 'ADMIN' | 'CLIENTE';
  emailConfirmado: boolean;
  criadoEm: Date;
}

export interface IUsuarioRepository {
  findById(id: string): Promise<Usuario | null>;
  findByEmail(email: string): Promise<Usuario | null>;
  save(usuario: Usuario): Promise<void>;
  findAll(busca?: string): Promise<UsuarioComPerfil[]>;
}
