import { Component, input, output } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { ServicoWizardUi } from '../../adapter/agendar.adapter';
import { CriarAgendamentoDto } from '../../api/agendar.api';

/** @deprecated Use the wizard step components instead */
@Component({
  selector: 'app-agendar-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './agendar-form.component.html',
})
export class AgendarFormComponent {
  readonly servicos = input.required<ServicoWizardUi[] | null>();
  readonly submitting = input.required<boolean | null>();
  readonly error = input.required<string | null>();
  readonly submitted = output<CriarAgendamentoDto>();

  protected readonly form = new FormGroup({
    servicoId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    dataHora: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    observacao: new FormControl('', { nonNullable: true }),
  });

  protected onSubmit(): void {
    if (this.form.invalid) return;
    const { servicoId, dataHora, observacao } = this.form.getRawValue();
    this.submitted.emit({ servicoId, dataHora: new Date(dataHora).toISOString(), observacoes: observacao || undefined });
  }
}
