import { Component, input, output, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogComponent, ButtonComponent } from 'ui';
import { ServicoFormData, ServicoUi } from '../../adapter/admin-servicos.adapter';

@Component({
  selector: 'app-servico-modal',
  standalone: true,
  imports: [FormsModule, DialogComponent, ButtonComponent],
  templateUrl: './servico-modal.component.html',
})
export class ServicoModalComponent implements OnChanges {
  readonly isOpen = input.required<boolean>();
  readonly servico = input.required<ServicoUi | null>();
  readonly saving = input.required<boolean>();

  readonly salvar = output<{ form: ServicoFormData; id?: string }>();
  readonly fechar = output<void>();

  form: ServicoFormData = {
    nome: '',
    descricao: '',
    preco: 0,
    duracaoMinutos: 30,
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['servico'] || changes['isOpen']) {
      const s = this.servico();
      if (s) {
        this.form = {
          nome: s.nome,
          descricao: s.descricao,
          preco: s.preco,
          duracaoMinutos: s.duracaoMinutos,
        };
      } else {
        this.form = { nome: '', descricao: '', preco: 0, duracaoMinutos: 30 };
      }
    }
  }

  get modalTitle(): string {
    return this.servico() ? 'Editar Serviço' : 'Novo Serviço';
  }

  onSubmit(): void {
    const s = this.servico();
    this.salvar.emit({ form: { ...this.form }, id: s?.id });
  }

  onClose(): void {
    this.fechar.emit();
  }
}
