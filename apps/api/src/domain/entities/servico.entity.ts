import { DomainError } from '../errors/domain.error.js';

interface ServicoProps {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  duracaoMinutos: number;
  ativo: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
}

export class Servico {
  private props: ServicoProps;

  private constructor(props: ServicoProps) {
    this.props = props;
  }

  static create(data: {
    nome: string;
    descricao?: string | null;
    preco: number;
    duracaoMinutos: number;
  }): Servico {
    if (data.nome.trim().length < 2) {
      throw new DomainError('Nome do serviço deve ter no mínimo 2 caracteres.');
    }
    if (data.preco < 0) {
      throw new DomainError('Preço do serviço não pode ser negativo.');
    }
    if (!Number.isInteger(data.duracaoMinutos) || data.duracaoMinutos <= 0) {
      throw new DomainError('Duração do serviço deve ser um inteiro maior que zero.');
    }
    const now = new Date();
    return new Servico({
      id: crypto.randomUUID(),
      nome: data.nome.trim(),
      descricao: data.descricao ?? null,
      preco: data.preco,
      duracaoMinutos: data.duracaoMinutos,
      ativo: true,
      criadoEm: now,
      atualizadoEm: now,
    });
  }

  static restore(props: ServicoProps): Servico {
    return new Servico(props);
  }

  atualizar(dados: {
    nome?: string;
    descricao?: string | null;
    preco?: number;
    duracaoMinutos?: number;
  }): void {
    if (dados.nome !== undefined) {
      if (dados.nome.trim().length < 2) {
        throw new DomainError('Nome do serviço deve ter no mínimo 2 caracteres.');
      }
      this.props.nome = dados.nome.trim();
    }
    if (dados.descricao !== undefined) {
      this.props.descricao = dados.descricao;
    }
    if (dados.preco !== undefined) {
      if (dados.preco < 0) {
        throw new DomainError('Preço do serviço não pode ser negativo.');
      }
      this.props.preco = dados.preco;
    }
    if (dados.duracaoMinutos !== undefined) {
      if (!Number.isInteger(dados.duracaoMinutos) || dados.duracaoMinutos <= 0) {
        throw new DomainError('Duração do serviço deve ser um inteiro maior que zero.');
      }
      this.props.duracaoMinutos = dados.duracaoMinutos;
    }
    this.props.atualizadoEm = new Date();
  }

  inativar(): void {
    this.props.ativo = false;
    this.props.atualizadoEm = new Date();
  }

  ativar(): void {
    this.props.ativo = true;
    this.props.atualizadoEm = new Date();
  }

  get id(): string {
    return this.props.id;
  }
  get nome(): string {
    return this.props.nome;
  }
  get descricao(): string | null {
    return this.props.descricao;
  }
  get preco(): number {
    return this.props.preco;
  }
  get duracaoMinutos(): number {
    return this.props.duracaoMinutos;
  }
  get ativo(): boolean {
    return this.props.ativo;
  }
  get criadoEm(): Date {
    return this.props.criadoEm;
  }
  get atualizadoEm(): Date {
    return this.props.atualizadoEm;
  }
}
