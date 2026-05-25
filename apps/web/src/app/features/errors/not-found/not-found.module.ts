import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NOT_FOUND_ROUTES } from './not-found.routing';

@NgModule({
  imports: [RouterModule.forChild(NOT_FOUND_ROUTES)],
})
export class NotFoundModule {}
