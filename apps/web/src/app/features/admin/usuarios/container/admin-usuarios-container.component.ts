import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminUsuariosFacade } from '../admin-usuarios.facade';
import { AdminUsuariosState } from '../state/admin-usuarios.state';
import { UsuariosTableComponent } from '../components/usuarios-table/usuarios-table.component';

@Component({
  selector: 'app-admin-usuarios-container',
  standalone: true,
  templateUrl: './admin-usuarios-container.component.html',
  imports: [AsyncPipe, FormsModule, UsuariosTableComponent],
  providers: [AdminUsuariosFacade, AdminUsuariosState],
})
export class AdminUsuariosContainerComponent implements OnInit {
  protected readonly facade = inject(AdminUsuariosFacade);

  readonly usuarios$ = this.facade.usuarios$;
  readonly loading$ = this.facade.loading$;
  readonly error$ = this.facade.error$;
  readonly busca$ = this.facade.busca$;

  busca = '';

  ngOnInit(): void {
    this.facade.load();
  }

  onBuscaChange(v: string): void {
    this.facade.setBusca(v);
  }
}
