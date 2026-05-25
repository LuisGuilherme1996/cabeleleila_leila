import { pool } from '../database/pool.js';
import { TokenAcao } from '../../domain/entities/token-acao.entity.js';
import type { TipoTokenAcao } from '../../domain/entities/token-acao.entity.js';
import type { ITokenAcaoRepository } from '../../domain/repositories/i-token-acao.repository.js';

interface TokenAcaoRow {
  id: string;
  usuario_id: string;
  token: string;
  tipo: TipoTokenAcao;
  usado: boolean;
  expira_em: Date;
  criado_em: Date;
}

function toEntity(row: TokenAcaoRow): TokenAcao {
  return TokenAcao.restore({
    id: row.id,
    usuarioId: row.usuario_id,
    token: row.token,
    tipo: row.tipo,
    usado: row.usado,
    expiraEm: row.expira_em,
    criadoEm: row.criado_em,
  });
}

export class PgTokenAcaoRepository implements ITokenAcaoRepository {
  async save(tokenAcao: TokenAcao): Promise<void> {
    await pool.query(
      `INSERT INTO tokens_acao (id, usuario_id, token, tipo, usado, expira_em, criado_em)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        tokenAcao.id,
        tokenAcao.usuarioId,
        tokenAcao.token,
        tokenAcao.tipo,
        tokenAcao.usado,
        tokenAcao.expiraEm,
        tokenAcao.criadoEm,
      ],
    );
  }

  async findByToken(token: string): Promise<TokenAcao | null> {
    const result = await pool.query<TokenAcaoRow>(
      'SELECT * FROM tokens_acao WHERE token = $1',
      [token],
    );
    return result.rows[0] ? toEntity(result.rows[0]) : null;
  }

  async update(tokenAcao: TokenAcao): Promise<void> {
    await pool.query('UPDATE tokens_acao SET usado = $1 WHERE id = $2', [
      tokenAcao.usado,
      tokenAcao.id,
    ]);
  }

  async revogarTokensAtivosPorUsuario(usuarioId: string, tipo: TipoTokenAcao): Promise<void> {
    await pool.query(
      `UPDATE tokens_acao SET usado = true
       WHERE usuario_id = $1 AND tipo = $2 AND usado = false`,
      [usuarioId, tipo],
    );
  }
}
