import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { AdminServicosFacade } from '../admin-servicos.facade';
import { ServicoFormData, ServicoUi } from '../adapter/admin-servicos.adapter';
import { ButtonComponent } from 'ui';
import { ServicosTableComponent } from '../components/servicos-table/servicos-table.component';
import { ServicoModalComponent } from '../components/servico-modal/servico-modal.component';
import { AdminServicosState } from '../state/admin-servicos.state';

@Component({
  selector: 'app-admin-servicos-container',
  standalone: true,
  templateUrl: './admin-servicos-container.component.html',
  imports: [AsyncPipe, ServicosTableComponent, ServicoModalComponent, ButtonComponent],
  providers: [AdminServicosFacade, AdminServicosState],
})
export class AdminServicosContainerComponent implements OnInit {
  protected readonly facade = inject(AdminServicosFacade);

  readonly servicos$ = this.facade.servicos$;
  readonly loading$ = this.facade.loading$;
  readonly saving$ = this.facade.saving$;
  readonly error$ = this.facade.error$;
  readonly modalOpen$ = this.facade.modalOpen$;
  readonly editingServico$ = this.facade.editingServico$;

  ngOnInit(): void {
    this.facade.load();
  }

  onNovoServico(): void {
    this.facade.abrirModalNovo();
  }

  onEditarServico(servico: ServicoUi): void {
    this.facade.abrirModalEditar(servico);
  }

  onToggleAtivo(servico: ServicoUi): void {
    this.facade.toggleAtivo(servico);
  }

  onExcluirServico(servico: ServicoUi): void {
    this.facade.excluir(servico);
  }

  onSalvar(data: { form: ServicoFormData; id?: string }): void {
    this.facade.salvar(data.form, data.id);
  }

  onFecharModal(): void {
    this.facade.fecharModal();
  }
}
