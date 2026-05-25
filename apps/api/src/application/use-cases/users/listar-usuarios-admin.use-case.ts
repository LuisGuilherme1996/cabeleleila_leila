import type { IUsuarioRepository, UsuarioComPerfil } from '../../../domain/repositories/i-usuario.repository.js';

export class ListarUsuariosAdminUseCase {
  constructor(private readonly usuarioRepository: IUsuarioRepository) {}

  async execute(busca?: string): Promise<UsuarioComPerfil[]> {
    return this.usuarioRepository.findAll(busca);
  }
}
