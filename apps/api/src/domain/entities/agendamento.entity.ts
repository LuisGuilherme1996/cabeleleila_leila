import { DomainError } from '../errors/domain.error.js';

export type StatusAgendamento = 'PENDENTE' | 'CONFIRMADO' | 'CONCLUIDO' | 'CANCELADO';

interface AgendamentoProps {
  id: string;
  clienteId: string;
  servicoId: string;
  nomeCliente?: string;
  emailCliente?: string;
  nomeServico?: string;
  dataHora: Date;
  status: StatusAgendamento;
  observacoes: string | null;
  criadoEm: Date;
  atualizadoEm: Date;
}

/**
 * Rich domain entity representing an appointment.
 * Enforces the state machine: PENDENTE → CONFIRMADO → CONCLUIDO
 *                             PENDENTE / CONFIRMADO → CANCELADO
 */
export class Agendamento {
  private props: AgendamentoProps;

  private constructor(props: AgendamentoProps) {
    this.props = props;
  }

  static create(data: {
    clienteId: string;
    servicoId: string;
    dataHora: Date;
    observacoes?: string | null;
    nomeCliente?: string;
    nomeServico?: string;
  }): Agendamento {
    const agora = new Date();
    const umHoraEmMs = 60 * 60 * 1000;

    if (data.dataHora.getTime() - agora.getTime() < umHoraEmMs) {
      throw new DomainError(
        'Não é possível agendar com menos de 1 hora de antecedência.',
        400,
      );
    }

    const now = new Date();
    return new Agendamento({
      id: crypto.randomUUID(),
      clienteId: data.clienteId,
      servicoId: data.servicoId,
      dataHora: data.dataHora,
      status: 'PENDENTE',
      observacoes: data.observacoes ?? null,
      criadoEm: now,
      atualizadoEm: now,
      nomeCliente: data.nomeCliente ?? undefined,
      emailCliente: undefined,
      nomeServico: data.nomeServico ?? undefined,
    });
  }

  static restore(props: AgendamentoProps): Agendamento {
    return new Agendamento(props);
  }

  confirmar(): void {
    if (this.props.status !== 'PENDENTE') {
      throw new DomainError(
        `Transição inválida: não é possível confirmar um agendamento com status '${this.props.status}'.`,
        409,
      );
    }
    this.props.status = 'CONFIRMADO';
    this.props.atualizadoEm = new Date();
  }

  concluir(): void {
    if (this.props.status !== 'CONFIRMADO') {
      throw new DomainError(
        `Transição inválida: não é possível concluir um agendamento com status '${this.props.status}'.`,
        409,
      );
    }
    this.props.status = 'CONCLUIDO';
    this.props.atualizadoEm = new Date();
  }

  cancelar(isAdmin: boolean): void {
    if (this.props.status === 'CONCLUIDO' || this.props.status === 'CANCELADO') {
      throw new DomainError(
        `Transição inválida: não é possível cancelar um agendamento com status '${this.props.status}'.`,
        409,
      );
    }

    if (!isAdmin) {
      const duasHorasEmMs = 2 * 60 * 60 * 1000;
      const agora = new Date();
      if (this.props.dataHora.getTime() - agora.getTime() < duasHorasEmMs) {
        throw new DomainError(
          'Cancelamento permitido somente com antecedência mínima de 2 horas.',
          400,
        );
      }
    }

    this.props.status = 'CANCELADO';
    this.props.atualizadoEm = new Date();
  }

  get id(): string {
    return this.props.id;
  }

  get clienteId(): string {
    return this.props.clienteId;
  }

  get servicoId(): string {
    return this.props.servicoId;
  }

  get dataHora(): Date {
    return this.props.dataHora;
  }

  get status(): StatusAgendamento {
    return this.props.status;
  }

  get observacoes(): string | null {
    return this.props.observacoes;
  }

  get criadoEm(): Date {
    return this.props.criadoEm;
  }

  get atualizadoEm(): Date {
    return this.props.atualizadoEm;
  }

  get nomeCliente(): string {
    return this.props.nomeCliente || '';
  }

  get emailCliente(): string {
    return this.props.emailCliente || '';
  }

  toJSON(): AgendamentoProps {
    return { ...this.props };
  }
}
