import type { RefreshToken } from '../entities/refresh-token.entity.js';

export interface IRefreshTokenRepository {
  findByToken(token: string): Promise<RefreshToken | null>;
  save(refreshToken: RefreshToken): Promise<void>;
  update(refreshToken: RefreshToken): Promise<void>;
  revogarTodosPorUsuarioId(usuarioId: string): Promise<void>;
}
