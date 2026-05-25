import { Component, input, output } from '@angular/core';
import { SlotUi } from '../../adapter/agendar.adapter';

@Component({
  selector: 'app-step-horario',
  standalone: true,
  imports: [],
  templateUrl: './step-horario.component.html',
})
export class StepHorarioComponent {
  readonly slots = input.required<SlotUi[] | null>();
  readonly loading = input.required<boolean | null>();
  readonly data = input.required<string | null>();
  readonly horarioSelecionado = output<string>();
  readonly voltarClicado = output<void>();

  protected formatarData(iso: string | null): string {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
    });
  }
}
