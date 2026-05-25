import type { HorarioFuncionamento } from '../entities/horario-funcionamento.entity.js';

export interface IHorarioFuncionamentoRepository {
  findAll(): Promise<HorarioFuncionamento[]>;
  findByDiaSemana(diaSemana: number): Promise<HorarioFuncionamento | null>;
  save(horario: HorarioFuncionamento): Promise<void>;
}
