import { pool } from '../database/pool.js';
import { Perfil } from '../../domain/entities/perfil.entity.js';
import type { NomePerfil } from '../../domain/entities/perfil.entity.js';
import type { IPerfilRepository } from '../../domain/repositories/i-perfil.repository.js';

interface PerfilRow {
  id: string;
  nome: NomePerfil;
  descricao: string | null;
}

function toEntity(row: PerfilRow): Perfil {
  return Perfil.restore({ id: row.id, nome: row.nome, descricao: row.descricao });
}

export class PgPerfilRepository implements IPerfilRepository {
  async findByNome(nome: NomePerfil): Promise<Perfil | null> {
    const result = await pool.query<PerfilRow>('SELECT * FROM perfis WHERE nome = $1', [nome]);
    return result.rows[0] ? toEntity(result.rows[0]) : null;
  }

  async associarPerfilAoUsuario(usuarioId: string, perfilId: string): Promise<void> {
    await pool.query(
      'INSERT INTO usuario_perfis (usuario_id, perfil_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [usuarioId, perfilId],
    );
  }

  async findPerfisByUsuarioId(usuarioId: string): Promise<Perfil[]> {
    const result = await pool.query<PerfilRow>(
      `SELECT p.id, p.nome, p.descricao
       FROM perfis p
       INNER JOIN usuario_perfis up ON up.perfil_id = p.id
       WHERE up.usuario_id = $1`,
      [usuarioId],
    );
    return result.rows.map(toEntity);
  }
}
