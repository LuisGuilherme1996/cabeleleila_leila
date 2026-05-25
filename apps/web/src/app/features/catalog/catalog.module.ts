import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CATALOG_ROUTES } from './catalog.routing';

@NgModule({
  imports: [RouterModule.forChild(CATALOG_ROUTES)],
})
export class CatalogModule {}
