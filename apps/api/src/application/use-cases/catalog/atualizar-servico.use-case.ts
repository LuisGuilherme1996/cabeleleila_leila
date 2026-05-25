import type { IServicoRepository } from '../../../domain/repositories/i-servico.repository.js';
import { ServicoNaoEncontradoError } from '../../../domain/errors/domain.error.js';
import type { AtualizarServicoInput, ServicoOutput } from '../../dtos/catalog/servico.dto.js';
import { servicoToOutput } from './criar-servico.use-case.js';

export class AtualizarServicoUseCase {
  constructor(private readonly servicoRepository: IServicoRepository) {}

  async execute(id: string, input: AtualizarServicoInput): Promise<ServicoOutput> {
    const servico = await this.servicoRepository.findById(id);
    if (!servico) throw new ServicoNaoEncontradoError();
    servico.atualizar(input);
    await this.servicoRepository.save(servico);
    return servicoToOutput(servico);
  }
}
