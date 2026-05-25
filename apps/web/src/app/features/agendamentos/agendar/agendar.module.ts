import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AGENDAR_ROUTES } from './agendar.routing';

@NgModule({
  imports: [RouterModule.forChild(AGENDAR_ROUTES)],
})
export class AgendarModule {}
