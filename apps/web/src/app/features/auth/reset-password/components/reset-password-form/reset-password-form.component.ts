import { Component, input, output, signal } from '@angular/core';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';

function senhasIguaisValidator(group: AbstractControl): ValidationErrors | null {
  const nova = group.get('novaSenha')?.value ?? '';
  const confirmar = group.get('confirmarSenha')?.value ?? '';
  return nova === confirmar ? null : { senhasDiferentes: true };
}

@Component({
  selector: 'app-reset-password-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './reset-password-form.component.html',
})
export class ResetPasswordFormComponent {
  readonly loading = input.required<boolean | null>();
  readonly error = input.required<string | null>();
  /** Emits the new password when valid */
  readonly submitted = output<string>();

  protected readonly showNova = signal(false);
  protected readonly showConfirmar = signal(false);

  protected readonly form = new FormGroup(
    {
      novaSenha: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(8)],
      }),
      confirmarSenha: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    },
    { validators: senhasIguaisValidator },
  );

  protected onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.submitted.emit(this.form.getRawValue().novaSenha);
  }
}
