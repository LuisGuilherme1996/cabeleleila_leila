import { Component, input } from '@angular/core';
import { UsuarioUi } from '../../adapter/admin-usuarios.adapter';

@Component({
  selector: 'app-usuarios-table',
  standalone: true,
  templateUrl: './usuarios-table.component.html',
})
export class UsuariosTableComponent {
  readonly usuarios = input.required<UsuarioUi[] | null>();
  readonly loading = input.required<boolean>();
}
