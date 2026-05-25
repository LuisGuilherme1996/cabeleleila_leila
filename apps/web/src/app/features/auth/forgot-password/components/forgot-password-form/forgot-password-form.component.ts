import { Component, input, output } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { ForgotPasswordRequestDto } from '../../api/forgot-password.api';

@Component({
  selector: 'app-forgot-password-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './forgot-password-form.component.html',
})
export class ForgotPasswordFormComponent {
  readonly loading = input.required<boolean | null>();
  readonly error = input.required<string | null>();
  readonly submitted = output<ForgotPasswordRequestDto>();

  protected readonly form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
  });

  protected onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.submitted.emit(this.form.getRawValue());
  }
}
