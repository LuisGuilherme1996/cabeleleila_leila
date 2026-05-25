import { pool } from '../database/pool.js';
import { HorarioFuncionamento } from '../../domain/entities/horario-funcionamento.entity.js';
import type { IHorarioFuncionamentoRepository } from '../../domain/repositories/i-horario-funcionamento.repository.js';

interface HorarioRow {
  id: string;
  dia_semana: number;
  hora_inicio: string;
  hora_fim: string;
  fechado: boolean;
}

function toEntity(row: HorarioRow): HorarioFuncionamento {
  return HorarioFuncionamento.restore({
    id: row.id,
    diaSemana: row.dia_semana,
    horaInicio: row.hora_inicio,
    horaFim: row.hora_fim,
    fechado: row.fechado,
  });
}

export class PgHorarioFuncionamentoRepository implements IHorarioFuncionamentoRepository {
  async findAll(): Promise<HorarioFuncionamento[]> {
    const result = await pool.query<HorarioRow>(
      'SELECT * FROM horarios_funcionamento ORDER BY dia_semana',
    );
    return result.rows.map(toEntity);
  }

  async findByDiaSemana(diaSemana: number): Promise<HorarioFuncionamento | null> {
    const result = await pool.query<HorarioRow>(
      'SELECT * FROM horarios_funcionamento WHERE dia_semana = $1',
      [diaSemana],
    );
    return result.rows[0] ? toEntity(result.rows[0]) : null;
  }

  async save(horario: HorarioFuncionamento): Promise<void> {
    await pool.query(
      `INSERT INTO horarios_funcionamento (id, dia_semana, hora_inicio, hora_fim, fechado)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (dia_semana) DO UPDATE
         SET hora_inicio = EXCLUDED.hora_inicio,
             hora_fim    = EXCLUDED.hora_fim,
             fechado     = EXCLUDED.fechado`,
      [horario.id, horario.diaSemana, horario.horaInicio, horario.horaFim, horario.fechado],
    );
  }
}
