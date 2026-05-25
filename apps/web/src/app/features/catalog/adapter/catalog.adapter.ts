import { Injectable } from '@angular/core';

export interface ServicoApiDto {
  id: string;
  nome: string;
  descricao: string | null;
  preco: string;
  duracaoMinutos: number;
  ativo: boolean;
}

export interface ServicoUi {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  duracaoFormatada: string;
  ativo: boolean;
}

@Injectable({ providedIn: 'root' })
export class CatalogAdapter {
  toUiList(raw: ServicoApiDto[]): ServicoUi[] {
    return raw.filter((s) => s.ativo).map((s) => this.toUi(s));
  }

  private toUi(s: ServicoApiDto): ServicoUi {
    const mins = s.duracaoMinutos;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    const duracaoFormatada = h > 0 ? `${h}h${m > 0 ? ` ${m}min` : ''}` : `${m}min`;

    return {
      id: s.id,
      nome: s.nome,
      descricao: s.descricao ?? '',
      preco: parseFloat(s.preco),
      duracaoFormatada,
      ativo: s.ativo,
    };
  }
}
