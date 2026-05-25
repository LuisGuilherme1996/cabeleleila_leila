import { Injectable } from '@angular/core';

export interface HorarioApiDto {
  status: string;
  data: HorarioItemDto[];
}

export interface HorarioItemDto {
  id: string;
  diaSemana: number;
  horaInicio: string;
  horaFim: string;
  fechado: boolean;
}

export interface HorarioUi {
  diaSemana: number;
  diaNome: string;
  horaInicio: string;
  horaFim: string;
  fechado: boolean;
}

const DIA_NOMES = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

@Injectable({ providedIn: 'root' })
export class AdminHorariosAdapter {
  toUiList(raw: HorarioApiDto): HorarioUi[] {
    // Build a full 7-day grid, filling in API data or defaults
    const byDia: Record<number, HorarioItemDto> = {};
    for (const h of raw.data) {
      byDia[h.diaSemana] = h;
    }

    return Array.from({ length: 7 }, (_, i) => {
      const h = byDia[i];
      return {
        diaSemana: i,
        diaNome: DIA_NOMES[i],
        horaInicio: h?.horaInicio ?? '08:00',
        horaFim: h?.horaFim ?? '18:00',
        fechado: h?.fechado ?? (i === 0), // Default: Sunday closed
      };
    });
  }
}
