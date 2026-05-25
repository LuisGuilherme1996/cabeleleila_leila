import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Router } from '@angular/router';
import { CatalogFacade } from '../catalog.facade';
import { CatalogState } from '../state/catalog.state';
import { ServiceCardComponent } from '../components/service-card/service-card.component';

@Component({
  selector: 'app-catalog-container',
  standalone: true,
  templateUrl: './catalog-container.component.html',
  imports: [AsyncPipe, ServiceCardComponent],
  providers: [CatalogFacade, CatalogState],
})
export class CatalogContainerComponent implements OnInit {
  protected readonly facade = inject(CatalogFacade);
  private readonly router = inject(Router);

  readonly servicos$ = this.facade.servicos$;
  readonly loading$ = this.facade.loading$;
  readonly error$ = this.facade.error$;

  ngOnInit(): void {
    this.facade.loadServicos();
  }

  protected onAgendar(servicoId: string): void {
    this.router.navigate(['/agendar'], { queryParams: { servicoId } });
  }
}
