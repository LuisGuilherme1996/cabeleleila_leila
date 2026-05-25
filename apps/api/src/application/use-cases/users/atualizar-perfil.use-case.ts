import type { IUsuarioRepository } from '../../../domain/repositories/i-usuario.repository.js';
import type { IPerfilRepository } from '../../../domain/repositories/i-perfil.repository.js';
import { UsuarioNaoEncontradoError } from '../../../domain/errors/domain.error.js';
import type {
  AtualizarPerfilInput,
  PerfilUsuarioOutput,
} from '../../dtos/users/atualizar-perfil.dto.js';

export class AtualizarPerfilUseCase {
  constructor(
    private readonly usuarioRepository: IUsuarioRepository,
    private readonly perfilRepository: IPerfilRepository,
  ) {}

  async execute(usuarioId: string, input: AtualizarPerfilInput): Promise<PerfilUsuarioOutput> {
    const usuario = await this.usuarioRepository.findById(usuarioId);
    if (!usuario) {
      throw new UsuarioNaoEncontradoError();
    }

    usuario.atualizarPerfil({ nome: input.nome, telefone: input.telefone });
    await this.usuarioRepository.save(usuario);

    const perfis = await this.perfilRepository.findPerfisByUsuarioId(usuarioId);

    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      telefone: usuario.telefone,
      emailConfirmado: usuario.emailConfirmado,
      perfis: perfis.map((p) => p.nome),
    };
  }
}
