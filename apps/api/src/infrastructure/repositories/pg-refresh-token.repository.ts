import { pool } from '../database/pool.js';
import { RefreshToken } from '../../domain/entities/refresh-token.entity.js';
import type { IRefreshTokenRepository } from '../../domain/repositories/i-refresh-token.repository.js';

interface RefreshTokenRow {
  id: string;
  usuario_id: string;
  token: string;
  revogado: boolean;
  expira_em: Date;
  criado_em: Date;
}

function toEntity(row: RefreshTokenRow): RefreshToken {
  return RefreshToken.restore({
    id: row.id,
    usuarioId: row.usuario_id,
    token: row.token,
    revogado: row.revogado,
    expiraEm: row.expira_em,
    criadoEm: row.criado_em,
  });
}

export class PgRefreshTokenRepository implements IRefreshTokenRepository {
  async findByToken(token: string): Promise<RefreshToken | null> {
    const result = await pool.query<RefreshTokenRow>(
      'SELECT * FROM sessoes_refresh_token WHERE token = $1',
      [token],
    );
    return result.rows[0] ? toEntity(result.rows[0]) : null;
  }

  async save(refreshToken: RefreshToken): Promise<void> {
    await pool.query(
      `INSERT INTO sessoes_refresh_token (id, usuario_id, token, revogado, expira_em, criado_em)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        refreshToken.id,
        refreshToken.usuarioId,
        refreshToken.token,
        refreshToken.revogado,
        refreshToken.expiraEm,
        refreshToken.criadoEm,
      ],
    );
  }

  async update(refreshToken: RefreshToken): Promise<void> {
    await pool.query(
      'UPDATE sessoes_refresh_token SET revogado = $1 WHERE id = $2',
      [refreshToken.revogado, refreshToken.id],
    );
  }

  async revogarTodosPorUsuarioId(usuarioId: string): Promise<void> {
    await pool.query(
      'UPDATE sessoes_refresh_token SET revogado = true WHERE usuario_id = $1',
      [usuarioId],
    );
  }
}
