import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { PerfilFacade } from '../perfil.facade';
import { PerfilState } from '../state/perfil.state';
import { PerfilAdapter } from '../adapter/perfil.adapter';
import { PerfilFormComponent } from '../components/perfil-form/perfil-form.component';
import { AtualizarPerfilRequestDto } from '../api/perfil.api';

@Component({
  selector: 'app-perfil-container',
  standalone: true,
  templateUrl: './perfil-container.component.html',
  imports: [AsyncPipe, PerfilFormComponent],
  providers: [PerfilFacade, PerfilState, PerfilAdapter],
})
export class PerfilContainerComponent implements OnInit {
  protected readonly facade = inject(PerfilFacade);

  readonly loading$ = this.facade.loading$;
  readonly saving$ = this.facade.saving$;
  readonly error$ = this.facade.error$;
  readonly success$ = this.facade.success$;
  readonly perfil$ = this.facade.perfil$;

  ngOnInit(): void {
    this.facade.loadPerfil();
  }

  protected onSave(payload: AtualizarPerfilRequestDto): void {
    this.facade.savePerfil(payload);
  }
}
