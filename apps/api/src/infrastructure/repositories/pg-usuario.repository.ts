import { pool } from '../database/pool.js';
import { Usuario } from '../../domain/entities/usuario.entity.js';
import type { IUsuarioRepository, UsuarioComPerfil } from '../../domain/repositories/i-usuario.repository.js';

interface UsuarioRow {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  senha_hash: string | null;
  email_confirmado: boolean;
  criado_em: Date;
  atualizado_em: Date;
}

interface UsuarioComPerfilRow {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  email_confirmado: boolean;
  criado_em: Date;
  perfil_nome: string | null;
}

function toEntity(row: UsuarioRow): Usuario {
  return Usuario.restore({
    id: row.id,
    nome: row.nome,
    email: row.email,
    telefone: row.telefone,
    senhaHash: row.senha_hash,
    emailConfirmado: row.email_confirmado,
    criadoEm: row.criado_em,
    atualizadoEm: row.atualizado_em,
  });
}

export class PgUsuarioRepository implements IUsuarioRepository {
  async findById(id: string): Promise<Usuario | null> {
    const result = await pool.query<UsuarioRow>('SELECT * FROM usuarios WHERE id = $1', [id]);
    return result.rows[0] ? toEntity(result.rows[0]) : null;
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    const result = await pool.query<UsuarioRow>('SELECT * FROM usuarios WHERE email = $1', [email]);
    return result.rows[0] ? toEntity(result.rows[0]) : null;
  }

  async save(usuario: Usuario): Promise<void> {
    await pool.query(
      `INSERT INTO usuarios (id, nome, email, telefone, senha_hash, email_confirmado, criado_em, atualizado_em)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO UPDATE
         SET nome             = EXCLUDED.nome,
             email            = EXCLUDED.email,
             telefone         = EXCLUDED.telefone,
             senha_hash       = EXCLUDED.senha_hash,
             email_confirmado = EXCLUDED.email_confirmado,
             atualizado_em    = EXCLUDED.atualizado_em`,
      [
        usuario.id,
        usuario.nome,
        usuario.email,
        usuario.telefone,
        usuario.senhaHash,
        usuario.emailConfirmado,
        usuario.criadoEm,
        usuario.atualizadoEm,
      ],
    );
  }

  async findAll(busca?: string): Promise<UsuarioComPerfil[]> {
    const params: string[] = [];
    let whereClause = '';

    if (busca && busca.trim().length > 0) {
      params.push(`%${busca.trim()}%`);
      whereClause = `WHERE u.nome ILIKE $1 OR u.email ILIKE $1`;
    }

    const query = `
      SELECT
        u.id,
        u.nome,
        u.email,
        u.telefone,
        u.email_confirmado,
        u.criado_em,
        p.nome AS perfil_nome
      FROM usuarios u
      LEFT JOIN usuario_perfis up ON up.usuario_id = u.id
      LEFT JOIN perfis p ON p.id = up.perfil_id
      ${whereClause}
      ORDER BY u.criado_em DESC
    `;

    const result = await pool.query<UsuarioComPerfilRow>(query, params);
    return result.rows.map((row) => ({
      id: row.id,
      nome: row.nome,
      email: row.email,
      telefone: row.telefone,
      perfil: (row.perfil_nome === 'ADMIN' ? 'ADMIN' : 'CLIENTE') as 'ADMIN' | 'CLIENTE',
      emailConfirmado: row.email_confirmado,
      criadoEm: row.criado_em,
    }));
  }
}
