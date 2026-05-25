import { Component, computed, inject, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { ForgotPasswordFacade } from '../forgot-password.facade';
import { ForgotPasswordState } from '../state/forgot-password.state';

function senhasIguaisValidator(group: AbstractControl): ValidationErrors | null {
  const senha = group.get('senha')?.value ?? '';
  const confirmar = group.get('confirmarSenha')?.value ?? '';
  return senha === confirmar ? null : { senhasDiferentes: true };
}

function calcularForca(senha: string): number {
  let score = 0;
  if (senha.length >= 8) score++;
  if (/[A-Z]/.test(senha)) score++;
  if (/[0-9]/.test(senha)) score++;
  if (/[^A-Za-z0-9]/.test(senha)) score++;
  return score;
}

@Component({
  selector: 'app-forgot-password-container',
  standalone: true,
  templateUrl: './forgot-password-container.component.html',
  imports: [AsyncPipe, RouterLink, ReactiveFormsModule],
  providers: [ForgotPasswordFacade, ForgotPasswordState],
})
export class ForgotPasswordContainerComponent {
  protected readonly facade = inject(ForgotPasswordFacade);

  readonly loading$ = this.facade.loading$;
  readonly error$ = this.facade.error$;
  readonly step$ = this.facade.step$;
  readonly email$ = this.facade.email$;

  protected readonly showPassword = signal(false);
  protected readonly showConfirmar = signal(false);

  // Forms
  protected readonly emailForm = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
  });

  protected readonly codeForm = new FormGroup({
    code: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6), Validators.maxLength(6), Validators.pattern('^[0-9]+$')],
    }),
  });

  protected readonly passwordForm = new FormGroup(
    {
      senha: new FormControl('', {
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

  private readonly senhaValue = toSignal(
    this.passwordForm.get('senha')!.valueChanges,
    { initialValue: '' },
  );

  protected readonly forcaSenha = computed(() => calcularForca(this.senhaValue() ?? ''));
  protected readonly forcaLabel = computed(() => {
    const f = this.forcaSenha();
    if (f === 0) return '';
    if (f === 1) return 'Fraca';
    if (f === 2) return 'Razoável';
    if (f === 3) return 'Boa';
    return 'Forte';
  });
  protected readonly forcaColor = computed(() => {
    const f = this.forcaSenha();
    if (f <= 1) return 'bg-red-500';
    if (f === 2) return 'bg-yellow-500';
    if (f === 3) return 'bg-blue-400';
    return 'bg-green-500';
  });

  protected onSubmitEmail(): void {
    this.emailForm.markAllAsTouched();
    if (this.emailForm.invalid) return;
    this.facade.requestReset(this.emailForm.getRawValue().email);
  }

  protected onSubmitCode(): void {
    this.codeForm.markAllAsTouched();
    if (this.codeForm.invalid) return;
    this.facade.verifyResetCode(this.codeForm.getRawValue().code);
  }

  protected onSubmitPassword(): void {
    this.passwordForm.markAllAsTouched();
    if (this.passwordForm.invalid) return;
    this.facade.resetPassword(this.passwordForm.getRawValue().senha);
  }

  protected toggleSenha(): void {
    this.showPassword.update((v) => !v);
  }

  protected toggleConfirmar(): void {
    this.showConfirmar.update((v) => !v);
  }

  protected backToRequest(): void {
    this.facade.resetToFirstStep();
  }
}
