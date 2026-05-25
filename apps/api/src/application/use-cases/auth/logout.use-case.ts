import type { IRefreshTokenRepository } from '../../../domain/repositories/i-refresh-token.repository.js';
import { RefreshTokenInvalidoError } from '../../../domain/errors/domain.error.js';

export class LogoutUseCase {
  constructor(private readonly refreshTokenRepository: IRefreshTokenRepository) {}

  async execute(tokenValue: string): Promise<void> {
    const sessao = await this.refreshTokenRepository.findByToken(tokenValue);
    if (!sessao) {
      throw new RefreshTokenInvalidoError();
    }

    sessao.revogar();
    await this.refreshTokenRepository.update(sessao);
  }
}
