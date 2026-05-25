import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FORBIDDEN_ROUTES } from './forbidden.routing';

@NgModule({
  imports: [RouterModule.forChild(FORBIDDEN_ROUTES)],
})
export class ForbiddenModule {}
