import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BloqueioFormData } from '../../adapter/admin-bloqueios.adapter';
import { ButtonComponent } from 'ui';

@Component({
  selector: 'app-bloqueio-form',
  standalone: true,
  imports: [FormsModule, ButtonComponent],
  templateUrl: './bloqueio-form.component.html',
})
export class BloqueioFormComponent {
  readonly saving = input.required<boolean>();

  readonly criar = output<BloqueioFormData>();

  form: BloqueioFormData = {
    dataInicio: '',
    dataFim: '',
    motivo: '',
  };

  onSubmit(): void {
    this.criar.emit({ ...this.form });
    this.form = { dataInicio: '', dataFim: '', motivo: '' };
  }
}
