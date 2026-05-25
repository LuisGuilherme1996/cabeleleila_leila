import type { IHorarioFuncionamentoRepository } from '../../../domain/repositories/i-horario-funcionamento.repository.js';
import type { HorarioFuncionamento } from '../../../domain/entities/horario-funcionamento.entity.js';
import type { HorarioFuncionamentoOutput } from '../../dtos/catalog/horario-funcionamento.dto.js';

export function horarioToOutput(horario: HorarioFuncionamento): HorarioFuncionamentoOutput {
  return {
    id: horario.id,
    diaSemana: horario.diaSemana,
    horaInicio: horario.horaInicio,
    horaFim: horario.horaFim,
    fechado: horario.fechado,
  };
}

export class ListarHorariosFuncionamentoUseCase {
  constructor(private readonly horarioRepository: IHorarioFuncionamentoRepository) {}

  async execute(): Promise<HorarioFuncionamentoOutput[]> {
    const horarios = await this.horarioRepository.findAll();
    return horarios.map(horarioToOutput);
  }
}
