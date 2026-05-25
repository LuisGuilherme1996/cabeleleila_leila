import crypto from 'node:crypto';
import { TokenAcao } from '../../../domain/entities/token-acao.entity.js';
import type { IUsuarioRepository } from '../../../domain/repositories/i-usuario.repository.js';
import type { ITokenAcaoRepository } from '../../../domain/repositories/i-token-acao.repository.js';
import { TokenAcaoInvalidoError, UsuarioNaoEncontradoError } from '../../../domain/errors/domain.error.js';
import type { VerifyResetCodeInput } from '../../dtos/auth/verify-reset-code.dto.js';
import { getRedisClient } from '../../../infrastructure/cache/redis.client.js';

export class VerifyResetCodeUseCase {
  constructor(
    private readonly usuarioRepository: IUsuarioRepository,
    private readonly tokenAcaoRepository: ITokenAcaoRepository,
  ) {}

  async execute(input: VerifyResetCodeInput): Promise<{ token: string }> {
    const usuario = await this.usuarioRepository.findByEmail(input.email);

    if (!usuario) {
      throw new UsuarioNaoEncontradoError();
    }

    const redis = getRedisClient();
    const savedCode = await redis.get(`recuperacao_senha:${input.email}`);

    if (!savedCode || savedCode !== input.code) {
      throw new TokenAcaoInvalidoError();
    }

    // Code matches, delete it from Redis
    await redis.del(`recuperacao_senha:${input.email}`);

    // Revoke previous recovery tokens
    await this.tokenAcaoRepository.revogarTokensAtivosPorUsuario(
      usuario.id,
      'RECUPERACAO_SENHA',
    );

    const rawToken = crypto.randomBytes(32).toString('hex');

    const tokenAcao = TokenAcao.create({
      usuarioId: usuario.id,
      token: rawToken,
      tipo: 'RECUPERACAO_SENHA',
      expiraEm: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });

    await this.tokenAcaoRepository.save(tokenAcao);

    return { token: rawToken };
  }
}
