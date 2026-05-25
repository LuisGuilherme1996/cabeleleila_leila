import { Injectable } from '@angular/core';

export interface ServicoApiDto {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number | string;
  duracaoMinutos: number;
  ativo: boolean;
}

export interface SlotApiDto {
  horario: string;
  disponivel: boolean;
}

export interface DisponibilidadeApiDto {
  data: string;
  servicoId: string;
  duracaoMinutos: number;
  slots: SlotApiDto[];
}

export interface ServicoWizardUi {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  duracaoMinutos: number;
  duracaoFormatada: string;
}

export interface SlotUi {
  horario: string;
  disponivel: boolean;
}

@Injectable({ providedIn: 'root' })
export class AgendarAdapter {
  toServicoWizardList(raw: ServicoApiDto[]): ServicoWizardUi[] {
    return raw.filter((s) => s.ativo).map((s) => this.toServicoWizard(s));
  }

  toSlotList(raw: DisponibilidadeApiDto): SlotUi[] {
    return raw.slots.map((s) => ({ horario: s.horario, disponivel: s.disponivel }));
  }

  private toServicoWizard(s: ServicoApiDto): ServicoWizardUi {
    const mins = s.duracaoMinutos;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    const duracaoFormatada = h > 0 ? `${h}h${m > 0 ? ` ${m}min` : ''}` : `${m}min`;

    return {
      id: s.id,
      nome: s.nome,
      descricao: s.descricao ?? '',
      preco: typeof s.preco === 'number' ? s.preco : parseFloat(s.preco),
      duracaoMinutos: s.duracaoMinutos,
      duracaoFormatada,
    };
  }
}
