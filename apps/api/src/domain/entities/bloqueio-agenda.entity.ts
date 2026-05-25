import { DomainError } from '../errors/domain.error.js';

interface BloqueioAgendaProps {
  id: string;
  dataInicio: Date;
  dataFim: Date;
  motivo: string;
  criadoEm: Date;
}

export class BloqueioAgenda {
  private props: BloqueioAgendaProps;

  private constructor(props: BloqueioAgendaProps) {
    this.props = props;
  }

  static create(data: { dataInicio: Date; dataFim: Date; motivo: string }): BloqueioAgenda {
    if (data.motivo.trim().length < 3) {
      throw new DomainError('Motivo do bloqueio deve ter no mínimo 3 caracteres.');
    }
    if (data.dataFim <= data.dataInicio) {
      throw new DomainError('Data de fim deve ser posterior à data de início.');
    }
    return new BloqueioAgenda({
      id: crypto.randomUUID(),
      dataInicio: data.dataInicio,
      dataFim: data.dataFim,
      motivo: data.motivo.trim(),
      criadoEm: new Date(),
    });
  }

  static restore(props: BloqueioAgendaProps): BloqueioAgenda {
    return new BloqueioAgenda(props);
  }

  get id(): string {
    return this.props.id;
  }
  get dataInicio(): Date {
    return this.props.dataInicio;
  }
  get dataFim(): Date {
    return this.props.dataFim;
  }
  get motivo(): string {
    return this.props.motivo;
  }
  get criadoEm(): Date {
    return this.props.criadoEm;
  }
}
