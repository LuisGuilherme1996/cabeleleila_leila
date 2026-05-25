import { DomainError } from '../errors/domain.error.js';

interface UsuarioProps {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  senhaHash: string | null;
  emailConfirmado: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
}

export class Usuario {
  private props: UsuarioProps;

  private constructor(props: UsuarioProps) {
    this.props = props;
  }

  static create(data: {
    nome: string;
    email: string;
    senhaHash?: string | null;
    telefone?: string | null;
  }): Usuario {
    if (!data.email.includes('@') || data.email.length < 5) {
      throw new DomainError('E-mail inválido.');
    }
    if (data.nome.trim().length < 2) {
      throw new DomainError('Nome deve ter no mínimo 2 caracteres.');
    }
    const now = new Date();
    return new Usuario({
      id: crypto.randomUUID(),
      nome: data.nome.trim(),
      email: data.email.toLowerCase().trim(),
      telefone: data.telefone ?? null,
      senhaHash: data.senhaHash ?? null,
      emailConfirmado: false,
      criadoEm: now,
      atualizadoEm: now,
    });
  }

  static restore(props: UsuarioProps): Usuario {
    return new Usuario(props);
  }

  confirmarEmail(): void {
    this.props.emailConfirmado = true;
    this.props.atualizadoEm = new Date();
  }

  atualizarPerfil(dados: { nome?: string; telefone?: string | null }): void {
    if (dados.nome !== undefined) {
      if (dados.nome.trim().length < 2) {
        throw new DomainError('Nome deve ter no mínimo 2 caracteres.');
      }
      this.props.nome = dados.nome.trim();
    }
    if (dados.telefone !== undefined) {
      this.props.telefone = dados.telefone;
    }
    this.props.atualizadoEm = new Date();
  }

  atualizarSenha(senhaHash: string): void {
    this.props.senhaHash = senhaHash;
    this.props.atualizadoEm = new Date();
  }

  get id(): string {
    return this.props.id;
  }
  get nome(): string {
    return this.props.nome;
  }
  get email(): string {
    return this.props.email;
  }
  get telefone(): string | null {
    return this.props.telefone;
  }
  get senhaHash(): string | null {
    return this.props.senhaHash;
  }
  get emailConfirmado(): boolean {
    return this.props.emailConfirmado;
  }
  get criadoEm(): Date {
    return this.props.criadoEm;
  }
  get atualizadoEm(): Date {
    return this.props.atualizadoEm;
  }
}
