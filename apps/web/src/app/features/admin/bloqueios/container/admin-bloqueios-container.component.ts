import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { AdminBloqueiosFacade } from '../admin-bloqueios.facade';
import { AdminBloqueiosState } from '../state/admin-bloqueios.state';
import { BloqueioFormData } from '../adapter/admin-bloqueios.adapter';
import { BloqueiosListComponent } from '../components/bloqueios-list/bloqueios-list.component';
import { BloqueioFormComponent } from '../components/bloqueio-form/bloqueio-form.component';

@Component({
  selector: 'app-admin-bloqueios-container',
  standalone: true,
  templateUrl: './admin-bloqueios-container.component.html',
  imports: [AsyncPipe, BloqueiosListComponent, BloqueioFormComponent],
  providers: [AdminBloqueiosFacade, AdminBloqueiosState],
})
export class AdminBloqueiosContainerComponent implements OnInit {
  protected readonly facade = inject(AdminBloqueiosFacade);

  readonly bloqueios$ = this.facade.bloqueios$;
  readonly loading$ = this.facade.loading$;
  readonly saving$ = this.facade.saving$;
  readonly error$ = this.facade.error$;

  ngOnInit(): void {
    this.facade.load();
  }

  onCriar(data: BloqueioFormData): void {
    this.facade.criar(data);
  }

  onRemover(id: string): void {
    this.facade.remover(id);
  }
}
