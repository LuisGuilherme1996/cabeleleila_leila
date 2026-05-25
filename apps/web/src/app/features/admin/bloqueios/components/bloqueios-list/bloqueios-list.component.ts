import { Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { BloqueioUi } from '../../adapter/admin-bloqueios.adapter';
import { ButtonComponent } from 'ui';

@Component({
  selector: 'app-bloqueios-list',
  standalone: true,
  imports: [DatePipe, ButtonComponent],
  templateUrl: './bloqueios-list.component.html',
})
export class BloqueiosListComponent {
  readonly bloqueios = input.required<BloqueioUi[] | null>();
  readonly loading = input.required<boolean>();

  readonly remover = output<string>();
}
