import { Component, input, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ServicoWizardUi } from '../../adapter/agendar.adapter';

@Component({
  selector: 'app-step-servico',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './step-servico.component.html',
})
export class StepServicoComponent {
  readonly servicos = input.required<ServicoWizardUi[] | null>();
  readonly loading = input.required<boolean | null>();
  readonly servicoSelecionado = output<ServicoWizardUi>();
}
