import crypto from 'node:crypto';
import { Usuario } from '../../../domain/entities/usuario.entity.js';
import { TokenAcao } from '../../../domain/entities/token-acao.entity.js';
import type { IUsuarioRepository } from '../../../domain/repositories/i-usuario.repository.js';
import type { IPerfilRepository } from '../../../domain/repositories/i-perfil.repository.js';
import type { ITokenAcaoRepository } from '../../../domain/repositories/i-token-acao.repository.js';
import type { IHashPort } from '../../ports/hash.port.js';
import { EmailJaExisteError } from '../../../domain/errors/domain.error.js';
import type {
  RegistrarUsuarioInput,
  RegistrarUsuarioOutput,
} from '../../dtos/auth/registrar-usuario.dto.js';
import { env } from '../../../config/env.js';

import type { IEmailPort } from '../../ports/email.port.js';

const EMAIL_TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24h

export class RegistrarUsuarioUseCase {
  constructor(
    private readonly usuarioRepository: IUsuarioRepository,
    private readonly perfilRepository: IPerfilRepository,
    private readonly tokenAcaoRepository: ITokenAcaoRepository,
    private readonly hashPort: IHashPort,
    private readonly emailPort: IEmailPort,
  ) {}

  async execute(input: RegistrarUsuarioInput): Promise<RegistrarUsuarioOutput> {
    const existente = await this.usuarioRepository.findByEmail(input.email);
    if (existente) {
      throw new EmailJaExisteError();
    }

    const senhaHash = await this.hashPort.hash(input.senha);

    const usuario = Usuario.create({
      nome: input.nome,
      email: input.email,
      telefone: input.telefone ?? null,
      senhaHash,
    });

    if (env.NODE_ENV !== 'production') {
      usuario.confirmarEmail();
    }

    await this.usuarioRepository.save(usuario);

    const perfilCliente = await this.perfilRepository.findByNome('CLIENTE');
    if (perfilCliente) {
      await this.perfilRepository.associarPerfilAoUsuario(usuario.id, perfilCliente.id);
    }

    const tokenConfirmacao = TokenAcao.create({
      usuarioId: usuario.id,
      token: crypto.randomBytes(32).toString('hex'),
      tipo: 'CONFIRMACAO_EMAIL',
      expiraEm: new Date(Date.now() + EMAIL_TOKEN_EXPIRY_MS),
    });

    await this.tokenAcaoRepository.save(tokenConfirmacao);

    // Envia o e-mail de confirmação de forma assíncrona
    this.emailPort.sendConfirmationEmail(usuario.email, usuario.nome, tokenConfirmacao.token)
      .catch((err) => console.error('[RegistrarUsuarioUseCase] Erro ao enviar e-mail de confirmação:', err));

    return { id: usuario.id, nome: usuario.nome, email: usuario.email };
  }
}
