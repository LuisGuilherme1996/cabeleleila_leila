import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ResetPasswordFacade } from '../reset-password.facade';
import { ResetPasswordState } from '../state/reset-password.state';
import { ResetPasswordFormComponent } from '../components/reset-password-form/reset-password-form.component';

@Component({
  selector: 'app-reset-password-container',
  standalone: true,
  templateUrl: './reset-password-container.component.html',
  imports: [AsyncPipe, RouterLink, ResetPasswordFormComponent],
  providers: [ResetPasswordFacade, ResetPasswordState],
})
export class ResetPasswordContainerComponent implements OnInit {
  protected readonly facade = inject(ResetPasswordFacade);
  private readonly route = inject(ActivatedRoute);

  readonly loading$ = this.facade.loading$;
  readonly error$ = this.facade.error$;
  readonly success$ = this.facade.success$;

  protected token = '';

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
  }

  protected onSubmit(novaSenha: string): void {
    if (!this.token) return;
    this.facade.resetPassword(this.token, novaSenha);
  }
}
