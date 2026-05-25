import type { IUsuarioRepository } from '../../../domain/repositories/i-usuario.repository.js';
import type { ITokenAcaoRepository } from '../../../domain/repositories/i-token-acao.repository.js';
import { TokenAcaoInvalidoError, UsuarioNaoEncontradoError } from '../../../domain/errors/domain.error.js';

export class ConfirmarEmailUseCase {
  constructor(
    private readonly usuarioRepository: IUsuarioRepository,
    private readonly tokenAcaoRepository: ITokenAcaoRepository,
  ) {}

  async execute(token: string): Promise<void> {
    const tokenAcao = await this.tokenAcaoRepository.findByToken(token);

    if (!tokenAcao || tokenAcao.tipo !== 'CONFIRMACAO_EMAIL' || !tokenAcao.estaValido()) {
      throw new TokenAcaoInvalidoError();
    }

    const usuario = await this.usuarioRepository.findById(tokenAcao.usuarioId);
    if (!usuario) {
      throw new UsuarioNaoEncontradoError();
    }

    usuario.confirmarEmail();
    await this.usuarioRepository.save(usuario);

    tokenAcao.marcarComoUsado();
    await this.tokenAcaoRepository.update(tokenAcao);
  }
}
