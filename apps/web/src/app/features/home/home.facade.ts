import { inject, Injectable } from '@angular/core';
import { HomeApi } from './api/home.api';
import { HomeAdapter } from './adapter/home.adapter';
import { HomeState } from './state/home.state';

@Injectable()
export class HomeFacade {
  private readonly api = inject(HomeApi);
  private readonly adapter = inject(HomeAdapter);
  private readonly state = inject(HomeState);

  readonly loading$ = this.state.loading$;
}
