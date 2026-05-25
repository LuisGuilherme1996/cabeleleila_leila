import { Component, input, output, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LoginRequestDto } from '../../api/login.api';
import { environment } from '../../../../../../environments/environment';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login-form.component.html',
})
export class LoginFormComponent {
  readonly loading = input.required<boolean | null>();
  readonly error = input.required<string | null>();
  readonly submitted = output<LoginRequestDto>();

  protected readonly showPassword = signal(false);
  protected readonly googleAuthUrl = `${environment.apiUrl}/auth/google`;

  protected readonly form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    senha: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)],
    }),
  });

  protected togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  protected onSubmit(): void {
    if (this.form.invalid) return;
    this.submitted.emit(this.form.getRawValue());
  }
}
