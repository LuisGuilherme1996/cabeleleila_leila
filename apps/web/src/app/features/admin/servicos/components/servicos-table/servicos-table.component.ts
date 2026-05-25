import { Component, input, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ServicoUi } from '../../adapter/admin-servicos.adapter';
import { ButtonComponent } from 'ui';

@Component({
  selector: 'app-servicos-table',
  standalone: true,
  imports: [CurrencyPipe, ButtonComponent],
  templateUrl: './servicos-table.component.html',
})
export class ServicosTableComponent {
  readonly servicos = input.required<ServicoUi[] | null>();
  readonly loading = input.required<boolean>();

  readonly editar = output<ServicoUi>();
  readonly toggleAtivo = output<ServicoUi>();
  readonly excluir = output<ServicoUi>();
}
