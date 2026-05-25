import { TokenAcao } from '../../../domain/entities/token-acao.entity.js';
import type { IUsuarioRepository } from '../../../domain/repositories/i-usuario.repository.js';
import type { ITokenAcaoRepository } from '../../../domain/repositories/i-token-acao.repository.js';
import type { EsqueciSenhaInput } from '../../dtos/auth/esqueci-senha.dto.js';
import { getRedisClient } from '../../../infrastructure/cache/redis.client.js';
import type { IEmailPort } from '../../ports/email.port.js';

export class EsqueciSenhaUseCase {
  constructor(
    private readonly usuarioRepository: IUsuarioRepository,
    private readonly tokenAcaoRepository: ITokenAcaoRepository,
    private readonly emailPort: IEmailPort,
  ) {}

  async execute(input: EsqueciSenhaInput): Promise<{ token: string }> {
    const usuario = await this.usuarioRepository.findByEmail(input.email);

    if (!usuario) {
      // Para evitar enumeração de usuários, retornamos sucesso sem gerar código/token ou enviar e-mail.
      return { token: '' };
    }

    // Revoke previous DB recovery tokens just to be clean
    await this.tokenAcaoRepository.revogarTokensAtivosPorUsuario(
      usuario.id,
      'RECUPERACAO_SENHA',
    );

    // Generate a secure 6-digit numeric code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Save in Redis for 15 minutes (900 seconds)
    const redis = getRedisClient();
    await redis.set(`recuperacao_senha:${usuario.email}`, code, 'EX', 900);

    // Envia o e-mail de recuperação de senha com o código de forma assíncrona
    this.emailPort.sendPasswordResetEmail(usuario.email, usuario.nome, code)
      .catch((err) => console.error('[EsqueciSenhaUseCase] Erro ao enviar e-mail de recuperação:', err));

    console.log(`[EsqueciSenha] Código de recuperação para ${usuario.email}: ${code}`);

    return { token: code };
  }
}
