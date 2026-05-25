import type { IUsuarioRepository } from '../../../domain/repositories/i-usuario.repository.js';
import type { ITokenAcaoRepository } from '../../../domain/repositories/i-token-acao.repository.js';
import type { IHashPort } from '../../ports/hash.port.js';
import { TokenAcaoInvalidoError, UsuarioNaoEncontradoError } from '../../../domain/errors/domain.error.js';
import type { RedefinirSenhaInput } from '../../dtos/auth/redefinir-senha.dto.js';

export class RedefinirSenhaUseCase {
  constructor(
    private readonly usuarioRepository: IUsuarioRepository,
    private readonly tokenAcaoRepository: ITokenAcaoRepository,
    private readonly hashPort: IHashPort,
  ) {}

  async execute(input: RedefinirSenhaInput): Promise<void> {
    const tokenAcao = await this.tokenAcaoRepository.findByToken(input.token);

    if (!tokenAcao || tokenAcao.tipo !== 'RECUPERACAO_SENHA' || !tokenAcao.estaValido()) {
      throw new TokenAcaoInvalidoError();
    }

    const usuario = await this.usuarioRepository.findById(tokenAcao.usuarioId);
    if (!usuario) {
      throw new UsuarioNaoEncontradoError();
    }

    const novaSenhaHash = await this.hashPort.hash(input.novaSenha);
    usuario.atualizarSenha(novaSenhaHash);

    await this.usuarioRepository.save(usuario);

    tokenAcao.marcarComoUsado();
    await this.tokenAcaoRepository.update(tokenAcao);
  }
}
