import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HOME_ROUTES } from './home.routing';

@NgModule({
  imports: [RouterModule.forChild(HOME_ROUTES)],
})
export class HomeModule {}
