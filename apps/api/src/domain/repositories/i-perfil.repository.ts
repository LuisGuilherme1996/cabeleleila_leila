import type { NomePerfil, Perfil } from '../entities/perfil.entity.js';

export interface IPerfilRepository {
  findByNome(nome: NomePerfil): Promise<Perfil | null>;
  associarPerfilAoUsuario(usuarioId: string, perfilId: string): Promise<void>;
  findPerfisByUsuarioId(usuarioId: string): Promise<Perfil[]>;
}
