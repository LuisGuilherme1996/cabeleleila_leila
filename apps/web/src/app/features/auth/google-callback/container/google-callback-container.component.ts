import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GoogleCallbackFacade } from '../google-callback.facade';

@Component({
  selector: 'app-google-callback-container',
  standalone: true,
  templateUrl: './google-callback-container.component.html',
  providers: [GoogleCallbackFacade],
})
export class GoogleCallbackContainerComponent implements OnInit {
  private readonly facade = inject(GoogleCallbackFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  ngOnInit(): void {
    const code = this.route.snapshot.queryParamMap.get('code');
    const error = this.route.snapshot.queryParamMap.get('error');

    if (error || !code) {
      this.router.navigate(['/login'], { queryParams: { error: 'oauth_denied' } });
      return;
    }

    this.facade.handleCallback(code);
  }
}
