import { Component, computed, input, output, signal } from '@angular/core';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { RegisterRequestDto } from '../../api/register.api';

/** Cross-field validator: confirma que confirmarSenha === senha */
function senhasIguaisValidator(group: AbstractControl): ValidationErrors | null {
  const senha = group.get('senha')?.value ?? '';
  const confirmar = group.get('confirmarSenha')?.value ?? '';
  return senha === confirmar ? null : { senhasDiferentes: true };
}

/** Força da senha: 0–4 pontos */
function calcularForca(senha: string): number {
  let score = 0;
  if (senha.length >= 8) score++;
  if (/[A-Z]/.test(senha)) score++;
  if (/[0-9]/.test(senha)) score++;
  if (/[^A-Za-z0-9]/.test(senha)) score++;
  return score;
}

/** Formata telefone no padrão (XX) XXXXX-XXXX */
function formatarTelefone(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : '';
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

@Component({
  selector: 'app-register-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './register-form.component.html',
})
export class RegisterFormComponent {
  readonly loading = input.required<boolean | null>();
  readonly error = input.required<string | null>();
  readonly submitted = output<RegisterRequestDto>();

  protected readonly showPassword = signal(false);
  protected readonly showConfirmar = signal(false);

  protected readonly form = new FormGroup(
    {
      nome: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(2)],
      }),
      email: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email],
      }),
      telefone: new FormControl('', { nonNullable: true }),
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

  /** Reactive password value — updates on every keystroke via valueChanges */
  private readonly senhaValue = toSignal(
    this.form.get('senha')!.valueChanges,
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

  protected onTelefoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const formatted = formatarTelefone(input.value);
    this.form.get('telefone')?.setValue(formatted, { emitEvent: false });
    input.value = formatted;
  }

  protected toggleSenha(): void {
    this.showPassword.update((v) => !v);
  }

  protected toggleConfirmar(): void {
    this.showConfirmar.update((v) => !v);
  }

  protected onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const { nome, email, senha, telefone } = this.form.getRawValue();
    const payload: RegisterRequestDto = { nome, email, senha };
    const rawDigits = telefone.replace(/\D/g, '');
    if (rawDigits.length >= 10) payload.telefone = telefone;
    this.submitted.emit(payload);
  }
}
