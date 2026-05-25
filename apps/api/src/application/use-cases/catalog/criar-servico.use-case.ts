import { Servico } from '../../../domain/entities/servico.entity.js';
import type { IServicoRepository } from '../../../domain/repositories/i-servico.repository.js';
import type { CriarServicoInput, ServicoOutput } from '../../dtos/catalog/servico.dto.js';

export function servicoToOutput(servico: Servico): ServicoOutput {
  return {
    id: servico.id,
    nome: servico.nome,
    descricao: servico.descricao,
    preco: servico.preco,
    duracaoMinutos: servico.duracaoMinutos,
    ativo: servico.ativo,
    criadoEm: servico.criadoEm,
    atualizadoEm: servico.atualizadoEm,
  };
}

export class CriarServicoUseCase {
  constructor(private readonly servicoRepository: IServicoRepository) {}

  async execute(input: CriarServicoInput): Promise<ServicoOutput> {
    const servico = Servico.create(input);
    await this.servicoRepository.save(servico);
    return servicoToOutput(servico);
  }
}
