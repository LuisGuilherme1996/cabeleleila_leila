import { Injectable } from '@angular/core';

export interface ServicoApiDto {
  status: string;
  data: ServicoItemDto[];
}

export interface ServicoItemDto {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  duracaoMinutos: number;
  ativo: boolean;
  criadoEm: string;
}

export interface ServicoUi {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  duracaoMinutos: number;
  ativo: boolean;
}

export interface ServicoFormData {
  nome: string;
  descricao: string;
  preco: number;
  duracaoMinutos: number;
}

@Injectable({ providedIn: 'root' })
export class AdminServicosAdapter {
  toUiList(raw: ServicoApiDto): ServicoUi[] {
    return raw.data.map((s) => this.toUi(s));
  }

  toUi(s: ServicoItemDto): ServicoUi {
    return {
      id: s.id,
      nome: s.nome,
      descricao: s.descricao ?? '',
      preco: s.preco,
      duracaoMinutos: s.duracaoMinutos,
      ativo: s.ativo,
    };
  }
}
