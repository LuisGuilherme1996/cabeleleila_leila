import { pool } from '../database/pool.js';
import { ConexaoOAuth } from '../../domain/entities/conexao-oauth.entity.js';
import type { IConexaoOAuthRepository } from '../../domain/repositories/i-conexao-oauth.repository.js';

interface ConexaoOAuthRow {
  id: string;
  usuario_id: string;
  provedor: string;
  provedor_usuario_id: string;
  criado_em: Date;
}

function toEntity(row: ConexaoOAuthRow): ConexaoOAuth {
  return ConexaoOAuth.restore({
    id: row.id,
    usuarioId: row.usuario_id,
    provedor: row.provedor,
    provedorUsuarioId: row.provedor_usuario_id,
    criadoEm: row.criado_em,
  });
}

export class PgConexaoOAuthRepository implements IConexaoOAuthRepository {
  async findByProvedorEProvedorId(
    provedor: string,
    provedorUsuarioId: string,
  ): Promise<ConexaoOAuth | null> {
    const result = await pool.query<ConexaoOAuthRow>(
      'SELECT * FROM conexoes_oauth WHERE provedor = $1 AND provedor_usuario_id = $2',
      [provedor, provedorUsuarioId],
    );
    return result.rows[0] ? toEntity(result.rows[0]) : null;
  }

  async save(conexao: ConexaoOAuth): Promise<void> {
    await pool.query(
      `INSERT INTO conexoes_oauth (id, usuario_id, provedor, provedor_usuario_id, criado_em)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (provedor, provedor_usuario_id) DO NOTHING`,
      [
        conexao.id,
        conexao.usuarioId,
        conexao.provedor,
        conexao.provedorUsuarioId,
        conexao.criadoEm,
      ],
    );
  }
}
