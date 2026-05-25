import { RefreshToken } from '../../../domain/entities/refresh-token.entity.js';
import type { IUsuarioRepository } from '../../../domain/repositories/i-usuario.repository.js';
import type { IPerfilRepository } from '../../../domain/repositories/i-perfil.repository.js';
import type { IRefreshTokenRepository } from '../../../domain/repositories/i-refresh-token.repository.js';
import type { IHashPort } from '../../ports/hash.port.js';
import type { ITokenPort } from '../../ports/token.port.js';
import { CredenciaisInvalidasError, EmailNaoConfirmadoError } from '../../../domain/errors/domain.error.js';
import type { LoginInput } from '../../dtos/auth/login.dto.js';

export interface LoginUseCaseOutput {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiry: Date;
  usuario: {
    id: string;
    nome: string;
    email: string;
    perfis: string[];
  };
}

export class LoginUseCase {
  constructor(
    private readonly usuarioRepository: IUsuarioRepository,
    private readonly perfilRepository: IPerfilRepository,
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly hashPort: IHashPort,
    private readonly tokenPort: ITokenPort,
  ) {}

  async execute(input: LoginInput): Promise<LoginUseCaseOutput> {
    const usuario = await this.usuarioRepository.findByEmail(input.email);
    if (!usuario || !usuario.senhaHash) {
      throw new CredenciaisInvalidasError();
    }

    const senhaValida = await this.hashPort.verify(input.senha, usuario.senhaHash);
    if (!senhaValida) {
      throw new CredenciaisInvalidasError();
    }

    if (!usuario.emailConfirmado) {
      throw new EmailNaoConfirmadoError();
    }

    const perfis = await this.perfilRepository.findPerfisByUsuarioId(usuario.id);
    const nomePerfis = perfis.map((p) => p.nome);

    const accessToken = this.tokenPort.signAccess({
      sub: usuario.id,
      email: usuario.email,
      perfis: nomePerfis,
    });

    const rawRefreshToken = this.tokenPort.generateRefreshToken();
    const expiraEm = this.tokenPort.getRefreshTokenExpiry();

    const sessao = RefreshToken.create({
      usuarioId: usuario.id,
      token: rawRefreshToken,
      expiraEm,
    });

    await this.refreshTokenRepository.save(sessao);

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      refreshTokenExpiry: expiraEm,
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, perfis: nomePerfis },
    };
  }
}
