import { HorarioFuncionamento } from '../../../domain/entities/horario-funcionamento.entity.js';
import type { IHorarioFuncionamentoRepository } from '../../../domain/repositories/i-horario-funcionamento.repository.js';
import type {
  SalvarHorarioFuncionamentoInput,
  HorarioFuncionamentoOutput,
} from '../../dtos/catalog/horario-funcionamento.dto.js';
import { horarioToOutput } from './listar-horarios-funcionamento.use-case.js';

export class SalvarHorarioFuncionamentoUseCase {
  constructor(private readonly horarioRepository: IHorarioFuncionamentoRepository) {}

  async execute(input: SalvarHorarioFuncionamentoInput): Promise<HorarioFuncionamentoOutput> {
    const existing = await this.horarioRepository.findByDiaSemana(input.diaSemana);

    let horario: HorarioFuncionamento;

    if (existing) {
      existing.atualizar({
        horaInicio: input.horaInicio,
        horaFim: input.horaFim,
        fechado: input.fechado,
      });
      horario = existing;
    } else {
      horario = HorarioFuncionamento.create(input);
    }

    await this.horarioRepository.save(horario);
    return horarioToOutput(horario);
  }
}
