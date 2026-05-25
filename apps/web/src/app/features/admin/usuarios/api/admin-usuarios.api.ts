import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';
import { UsuariosApiDto } from '../adapter/admin-usuarios.adapter';

@Injectable({ providedIn: 'root' })
export class AdminUsuariosApi {
  private readonly api = inject(ApiService);

  listar(busca?: string): Observable<UsuariosApiDto> {
    const params = busca ? { busca } : undefined;
    return this.api.get<UsuariosApiDto>('/admin/usuarios', params);
  }
}
