import { Injectable } from '@angular/core';

export interface BloqueioApiDto {
  status: string;
  data: BloqueioItemDto[];
}

export interface BloqueioItemDto {
  id: string;
  dataInicio: string;
  dataFim: string;
  motivo: string;
  criadoEm: string;
}

export interface BloqueioUi {
  id: string;
  dataInicio: string;
  dataFim: string;
  motivo: string;
}

export interface BloqueioFormData {
  dataInicio: string;
  dataFim: string;
  motivo: string;
}

@Injectable({ providedIn: 'root' })
export class AdminBloqueiosAdapter {
  toUiList(raw: BloqueioApiDto): BloqueioUi[] {
    return raw.data.map((b) => ({
      id: b.id,
      dataInicio: b.dataInicio,
      dataFim: b.dataFim,
      motivo: b.motivo,
    }));
  }
}
