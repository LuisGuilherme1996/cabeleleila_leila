import type { IServicoRepository } from '../../../domain/repositories/i-servico.repository.js';
import type { ServicoOutput } from '../../dtos/catalog/servico.dto.js';
import { servicoToOutput } from './criar-servico.use-case.js';

export class ListarServicosUseCase {
  constructor(private readonly servicoRepository: IServicoRepository) {}

  async execute(apenasAtivos: boolean): Promise<ServicoOutput[]> {
    const servicos = await this.servicoRepository.findAll(apenasAtivos);
    return servicos.map(servicoToOutput);
  }
}
