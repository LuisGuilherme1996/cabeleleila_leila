import { Component, input, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { AgendamentoUi } from '../../adapter/meus-agendamentos.adapter';

@Component({
  selector: 'app-agendamento-card',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './agendamento-card.component.html',
})
export class AgendamentoCardComponent {
  readonly agendamento = input.required<AgendamentoUi>();
  readonly cancelarSolicitado = output<string>();

  protected onSolicitarCancelamento(): void {
    this.cancelarSolicitado.emit(this.agendamento().id);
  }
}
