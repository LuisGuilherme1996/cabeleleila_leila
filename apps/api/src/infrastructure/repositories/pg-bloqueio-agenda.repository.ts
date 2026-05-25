import { pool } from '../database/pool.js';
import { BloqueioAgenda } from '../../domain/entities/bloqueio-agenda.entity.js';
import type { IBloqueioAgendaRepository } from '../../domain/repositories/i-bloqueio-agenda.repository.js';

interface BloqueioRow {
  id: string;
  data_inicio: Date;
  data_fim: Date;
  motivo: string;
  criado_em: Date;
}

function toEntity(row: BloqueioRow): BloqueioAgenda {
  return BloqueioAgenda.restore({
    id: row.id,
    dataInicio: row.data_inicio,
    dataFim: row.data_fim,
    motivo: row.motivo,
    criadoEm: row.criado_em,
  });
}

export class PgBloqueioAgendaRepository implements IBloqueioAgendaRepository {
  async findAll(): Promise<BloqueioAgenda[]> {
    const result = await pool.query<BloqueioRow>(
      'SELECT * FROM bloqueios_agenda ORDER BY data_inicio',
    );
    return result.rows.map(toEntity);
  }

  async findById(id: string): Promise<BloqueioAgenda | null> {
    const result = await pool.query<BloqueioRow>(
      'SELECT * FROM bloqueios_agenda WHERE id = $1',
      [id],
    );
    return result.rows[0] ? toEntity(result.rows[0]) : null;
  }

  async findNoPeriodo(dataInicio: Date, dataFim: Date): Promise<BloqueioAgenda[]> {
    const result = await pool.query<BloqueioRow>(
      `SELECT * FROM bloqueios_agenda
       WHERE data_inicio < $2
         AND data_fim    > $1
       ORDER BY data_inicio`,
      [dataInicio, dataFim],
    );
    return result.rows.map(toEntity);
  }

  async save(bloqueio: BloqueioAgenda): Promise<void> {
    await pool.query(
      `INSERT INTO bloqueios_agenda (id, data_inicio, data_fim, motivo, criado_em)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE
         SET data_inicio = EXCLUDED.data_inicio,
             data_fim    = EXCLUDED.data_fim,
             motivo      = EXCLUDED.motivo`,
      [bloqueio.id, bloqueio.dataInicio, bloqueio.dataFim, bloqueio.motivo, bloqueio.criadoEm],
    );
  }

  async delete(id: string): Promise<void> {
    await pool.query('DELETE FROM bloqueios_agenda WHERE id = $1', [id]);
  }
}
