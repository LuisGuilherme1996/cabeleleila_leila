import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { GOOGLE_CALLBACK_ROUTES } from './google-callback.routing';

@NgModule({
  imports: [RouterModule.forChild(GOOGLE_CALLBACK_ROUTES)],
})
export class GoogleCallbackModule {}
