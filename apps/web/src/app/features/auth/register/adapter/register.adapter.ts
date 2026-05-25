import { Injectable } from '@angular/core';
import { RegisterResponseApiDto } from '../api/register.api';

export interface RegisterResultUi {
  id: string;
  nome: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class RegisterAdapter {
  toUi(raw: RegisterResponseApiDto): RegisterResultUi {
    return {
      id: raw.data.id,
      nome: raw.data.nome,
      email: raw.data.email,
    };
  }
}
