import { DomainError } from '../errors/domain.error.js';

interface HorarioFuncionamentoProps {
  id: string;
  /** 0 = Domingo, 1 = Segunda … 6 = Sábado */
  diaSemana: number;
  /** Formato HH:MM */
  horaInicio: string;
  /** Formato HH:MM */
  horaFim: string;
  fechado: boolean;
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

const HHMM_REGEX = /^\d{2}:\d{2}$/;

export class HorarioFuncionamento {
  private props: HorarioFuncionamentoProps;

  private constructor(props: HorarioFuncionamentoProps) {
    this.props = props;
  }

  private static validate(data: {
    diaSemana: number;
    horaInicio: string;
    horaFim: string;
    fechado: boolean;
  }): void {
    if (!Number.isInteger(data.diaSemana) || data.diaSemana < 0 || data.diaSemana > 6) {
      throw new DomainError(
        'Dia da semana inválido. Deve ser um inteiro entre 0 (Domingo) e 6 (Sábado).',
      );
    }
    if (!data.fechado) {
      if (!HHMM_REGEX.test(data.horaInicio) || !HHMM_REGEX.test(data.horaFim)) {
        throw new DomainError('Horário deve estar no formato HH:MM.');
      }
      if (toMinutes(data.horaFim) <= toMinutes(data.horaInicio)) {
        throw new DomainError('Hora de término deve ser posterior à hora de início.');
      }
    }
  }

  static create(data: {
    diaSemana: number;
    horaInicio: string;
    horaFim: string;
    fechado?: boolean;
  }): HorarioFuncionamento {
    const props = {
      diaSemana: data.diaSemana,
      horaInicio: data.horaInicio,
      horaFim: data.horaFim,
      fechado: data.fechado ?? false,
    };
    HorarioFuncionamento.validate(props);
    return new HorarioFuncionamento({ id: crypto.randomUUID(), ...props });
  }

  static restore(props: HorarioFuncionamentoProps): HorarioFuncionamento {
    return new HorarioFuncionamento(props);
  }

  atualizar(dados: { horaInicio?: string; horaFim?: string; fechado?: boolean }): void {
    const updated = {
      diaSemana: this.props.diaSemana,
      horaInicio: dados.horaInicio ?? this.props.horaInicio,
      horaFim: dados.horaFim ?? this.props.horaFim,
      fechado: dados.fechado ?? this.props.fechado,
    };
    HorarioFuncionamento.validate(updated);
    this.props.horaInicio = updated.horaInicio;
    this.props.horaFim = updated.horaFim;
    this.props.fechado = updated.fechado;
  }

  get id(): string {
    return this.props.id;
  }
  get diaSemana(): number {
    return this.props.diaSemana;
  }
  get horaInicio(): string {
    return this.props.horaInicio;
  }
  get horaFim(): string {
    return this.props.horaFim;
  }
  get fechado(): boolean {
    return this.props.fechado;
  }
}
