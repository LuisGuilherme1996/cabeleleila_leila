import { pool } from '../database/pool.js';
import { Servico } from '../../domain/entities/servico.entity.js';
import type { IServicoRepository } from '../../domain/repositories/i-servico.repository.js';

interface ServicoRow {
  id: string;
  nome: string;
  descricao: string | null;
  preco: string; // pg returns NUMERIC as string
  duracao_minutos: number;
  ativo: boolean;
  criado_em: Date;
  atualizado_em: Date;
}

function toEntity(row: ServicoRow): Servico {
  return Servico.restore({
    id: row.id,
    nome: row.nome,
    descricao: row.descricao,
    preco: parseFloat(row.preco),
    duracaoMinutos: row.duracao_minutos,
    ativo: row.ativo,
    criadoEm: row.criado_em,
    atualizadoEm: row.atualizado_em,
  });
}

export class PgServicoRepository implements IServicoRepository {
  async findById(id: string): Promise<Servico | null> {
    const result = await pool.query<ServicoRow>('SELECT * FROM servicos WHERE id = $1', [id]);
    return result.rows[0] ? toEntity(result.rows[0]) : null;
  }

  async findAll(apenasAtivos = false): Promise<Servico[]> {
    const sql = apenasAtivos
      ? 'SELECT * FROM servicos WHERE ativo = TRUE ORDER BY nome'
      : 'SELECT * FROM servicos ORDER BY nome';
    const result = await pool.query<ServicoRow>(sql);
    return result.rows.map(toEntity);
  }

  async save(servico: Servico): Promise<void> {
    await pool.query(
      `INSERT INTO servicos (id, nome, descricao, preco, duracao_minutos, ativo, criado_em, atualizado_em)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO UPDATE
         SET nome            = EXCLUDED.nome,
             descricao       = EXCLUDED.descricao,
             preco           = EXCLUDED.preco,
             duracao_minutos = EXCLUDED.duracao_minutos,
             ativo           = EXCLUDED.ativo,
             atualizado_em   = EXCLUDED.atualizado_em`,
      [
        servico.id,
        servico.nome,
        servico.descricao,
        servico.preco,
        servico.duracaoMinutos,
        servico.ativo,
        servico.criadoEm,
        servico.atualizadoEm,
      ],
    );
  }

  async delete(id: string): Promise<void> {
    await pool.query('DELETE FROM servicos WHERE id = $1', [id]);
  }
}
