import { Component, input, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ServicoUi } from '../../adapter/catalog.adapter';

@Component({
  selector: 'app-service-card',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './service-card.component.html',
})
export class ServiceCardComponent {
  readonly servico = input.required<ServicoUi>();
  readonly agendarClicado = output<string>();

  protected onAgendar(): void {
    this.agendarClicado.emit(this.servico().id);
  }
}
