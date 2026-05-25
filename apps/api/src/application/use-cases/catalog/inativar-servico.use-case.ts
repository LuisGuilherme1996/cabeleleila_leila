import type { IServicoRepository } from '../../../domain/repositories/i-servico.repository.js';
import { ServicoNaoEncontradoError } from '../../../domain/errors/domain.error.js';
import type { ServicoOutput } from '../../dtos/catalog/servico.dto.js';
import { servicoToOutput } from './criar-servico.use-case.js';

export class InativarServicoUseCase {
  constructor(private readonly servicoRepository: IServicoRepository) {}

  async execute(id: string): Promise<ServicoOutput> {
    const servico = await this.servicoRepository.findById(id);
    if (!servico) throw new ServicoNaoEncontradoError();
    servico.inativar();
    await this.servicoRepository.save(servico);
    return servicoToOutput(servico);
  }
}
