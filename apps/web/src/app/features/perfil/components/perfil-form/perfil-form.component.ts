import { Component, input, output, OnChanges, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { PerfilUi } from '../../adapter/perfil.adapter';
import { AtualizarPerfilRequestDto } from '../../api/perfil.api';

function formatarTelefone(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : '';
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

@Component({
  selector: 'app-perfil-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './perfil-form.component.html',
})
export class PerfilFormComponent implements OnChanges {
  readonly perfil = input.required<PerfilUi | null>();
  readonly saving = input.required<boolean | null>();
  readonly error = input.required<string | null>();
  readonly success = input.required<boolean | null>();
  readonly submitted = output<AtualizarPerfilRequestDto>();

  protected readonly editMode = signal(false);

  protected readonly form = new FormGroup({
    nome: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
    telefone: new FormControl('', { nonNullable: true }),
  });

  ngOnChanges(): void {
    const p = this.perfil();
    if (p) {
      this.form.patchValue({ nome: p.nome, telefone: p.telefone ?? '' });
    }
  }

  protected enterEdit(): void {
    this.editMode.set(true);
  }

  protected cancelEdit(): void {
    const p = this.perfil();
    if (p) this.form.patchValue({ nome: p.nome, telefone: p.telefone ?? '' });
    this.editMode.set(false);
  }

  protected onTelefoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const formatted = formatarTelefone(input.value);
    this.form.get('telefone')?.setValue(formatted, { emitEvent: false });
    input.value = formatted;
  }

  protected onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const { nome, telefone } = this.form.getRawValue();
    const payload: AtualizarPerfilRequestDto = { nome };
    const rawDigits = telefone.replace(/\D/g, '');
    payload.telefone = rawDigits.length >= 10 ? telefone : null;
    this.submitted.emit(payload);
    this.editMode.set(false);
  }
}
