import type { IServicoRepository } from '../../../domain/repositories/i-servico.repository.js';
import { ServicoNaoEncontradoError, DomainError } from '../../../domain/errors/domain.error.js';

export class ExcluirServicoUseCase {
  constructor(private readonly servicoRepository: IServicoRepository) {}

  async execute(id: string): Promise<void> {
    const servico = await this.servicoRepository.findById(id);
    if (!servico) throw new ServicoNaoEncontradoError();
    
    try {
      await this.servicoRepository.delete(id);
    } catch (error: any) {
      // Código PostgreSQL para erro de chave estrangeira (foreign_key_violation)
      if (error?.code === '23503') {
        throw new DomainError(
          'Não é possível excluir este serviço permanentemente pois ele possui agendamentos associados. ' +
          'Se desejar, você pode desativá-lo para que não seja mais exibido para novos agendamentos.',
          400
        );
      }
      throw error;
    }
  }
}
