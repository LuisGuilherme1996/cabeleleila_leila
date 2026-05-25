import { pool } from '../database/pool.js';
import type { AgendamentoSlot } from '../../domain/repositories/i-agendamento.repository.js';

interface AgendamentoRow {
  data_hora: Date;
  duracao_minutos: string; // pg returns INTEGER as string when joined
}

/**
 * @deprecated Use PgAgendamentoRepository instead.
 * This file is kept for reference only; the full repository is now PgAgendamentoRepository.
 */
export class PgAgendamentoDisponibilidadeRepository {
  async findAgendamentosNoPeriodo(dataInicio: Date, dataFim: Date): Promise<AgendamentoSlot[]> {
    const result = await pool.query<AgendamentoRow>(
      `SELECT a.data_hora, s.duracao_minutos
       FROM agendamentos a
       JOIN servicos s ON s.id = a.servico_id
       WHERE a.status != 'CANCELADO'
         AND a.data_hora < $2
         AND (a.data_hora + (s.duracao_minutos * INTERVAL '1 minute')) > $1`,
      [dataInicio, dataFim],
    );
    return result.rows.map((row) => ({
      dataHora: row.data_hora,
      duracaoMinutos: Number(row.duracao_minutos),
    }));
  }
}
