import { Component, input, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServicoWizardUi } from '../../adapter/agendar.adapter';

export interface ConfirmarPayload {
  observacao: string;
}

@Component({
  selector: 'app-step-resumo',
  standalone: true,
  imports: [CurrencyPipe, FormsModule],
  templateUrl: './step-resumo.component.html',
})
export class StepResumoComponent {
  readonly servico = input.required<ServicoWizardUi | null>();
  readonly data = input.required<string | null>();
  readonly horario = input.required<string | null>();
  readonly submitting = input.required<boolean | null>();
  readonly error = input.required<string | null>();
  readonly confirmado = output<ConfirmarPayload>();
  readonly voltarClicado = output<void>();

  protected observacao = '';

  protected formatarData(iso: string | null): string {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }

  protected onConfirmar(): void {
    this.confirmado.emit({ observacao: this.observacao });
  }
}
