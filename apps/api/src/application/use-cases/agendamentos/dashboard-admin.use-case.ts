import type { IAgendamentoRepository } from '../../../domain/repositories/i-agendamento.repository.js';
import type { DashboardOutput } from '../../dtos/agendamentos/agendamento.dto.js';

export class DashboardAdminUseCase {
  constructor(private readonly agendamentoRepository: IAgendamentoRepository) {}

  async execute(): Promise<DashboardOutput> {
    return this.agendamentoRepository.getDashboardData(new Date());
  }
}
