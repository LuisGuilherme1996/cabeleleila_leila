import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RegisterFacade } from '../register.facade';
import { RegisterState } from '../state/register.state';
import { RegisterFormComponent } from '../components/register-form/register-form.component';
import { RegisterRequestDto } from '../api/register.api';

@Component({
  selector: 'app-register-container',
  standalone: true,
  templateUrl: './register-container.component.html',
  imports: [AsyncPipe, RouterLink, RegisterFormComponent],
  providers: [RegisterFacade, RegisterState],
})
export class RegisterContainerComponent {
  protected readonly facade = inject(RegisterFacade);

  readonly loading$ = this.facade.loading$;
  readonly error$ = this.facade.error$;
  readonly success$ = this.facade.success$;

  protected onRegister(payload: RegisterRequestDto): void {
    this.facade.register(payload);
  }
}
