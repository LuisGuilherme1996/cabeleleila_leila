import { RefreshToken } from '../../../domain/entities/refresh-token.entity.js';
import type { IUsuarioRepository } from '../../../domain/repositories/i-usuario.repository.js';
import type { IPerfilRepository } from '../../../domain/repositories/i-perfil.repository.js';
import type { IRefreshTokenRepository } from '../../../domain/repositories/i-refresh-token.repository.js';
import type { ITokenPort } from '../../ports/token.port.js';
import { RefreshTokenInvalidoError } from '../../../domain/errors/domain.error.js';

export interface RefreshTokenOutput {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiry: Date;
}

export class RefreshTokenUseCase {
  constructor(
    private readonly usuarioRepository: IUsuarioRepository,
    private readonly perfilRepository: IPerfilRepository,
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly tokenPort: ITokenPort,
  ) {}

  async execute(tokenValue: string): Promise<RefreshTokenOutput> {
    const sessao = await this.refreshTokenRepository.findByToken(tokenValue);
    if (!sessao) {
      throw new RefreshTokenInvalidoError();
    }

    // RTR: token já revogado = possível roubo → invalida toda a família
    if (sessao.estaRevogado()) {
      await this.refreshTokenRepository.revogarTodosPorUsuarioId(sessao.usuarioId);
      throw new RefreshTokenInvalidoError();
    }

    if (sessao.estaExpirado()) {
      throw new RefreshTokenInvalidoError();
    }

    // Revoga o token usado
    sessao.revogar();
    await this.refreshTokenRepository.update(sessao);

    const usuario = await this.usuarioRepository.findById(sessao.usuarioId);
    if (!usuario) {
      throw new RefreshTokenInvalidoError();
    }

    const perfis = await this.perfilRepository.findPerfisByUsuarioId(usuario.id);

    const accessToken = this.tokenPort.signAccess({
      sub: usuario.id,
      email: usuario.email,
      perfis: perfis.map((p) => p.nome),
    });

    const rawRefreshToken = this.tokenPort.generateRefreshToken();
    const expiraEm = this.tokenPort.getRefreshTokenExpiry();

    const novaSessao = RefreshToken.create({
      usuarioId: usuario.id,
      token: rawRefreshToken,
      expiraEm,
    });

    await this.refreshTokenRepository.save(novaSessao);

    return { accessToken, refreshToken: rawRefreshToken, refreshTokenExpiry: expiraEm };
  }
}
