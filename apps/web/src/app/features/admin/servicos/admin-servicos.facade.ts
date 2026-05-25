import { inject, Injectable } from '@angular/core';
import { AdminServicosApi } from './api/admin-servicos.api';
import { AdminServicosAdapter, ServicoFormData, ServicoUi } from './adapter/admin-servicos.adapter';
import { AdminServicosState } from './state/admin-servicos.state';
import { ToastService } from '../../../core/services/toast.service';

@Injectable()
export class AdminServicosFacade {
  private readonly api = inject(AdminServicosApi);
  private readonly adapter = inject(AdminServicosAdapter);
  private readonly state = inject(AdminServicosState);
  private readonly toast = inject(ToastService);

  readonly servicos$ = this.state.servicos$;
  readonly loading$ = this.state.loading$;
  readonly saving$ = this.state.saving$;
  readonly error$ = this.state.error$;
  readonly modalOpen$ = this.state.modalOpen$;
  readonly editingServico$ = this.state.editingServico$;

  load(): void {
    this.state.setLoading(true);
    this.state.setError(null);
    this.api.listar().subscribe({
      next: (raw) => {
        this.state.setServicos(this.adapter.toUiList(raw));
        this.state.setLoading(false);
      },
      error: (err: Error) => {
        this.state.setError(err.message ?? 'Erro ao carregar serviços.');
        this.state.setLoading(false);
      },
    });
  }

  abrirModalNovo(): void {
    this.state.openModal(null);
  }

  abrirModalEditar(servico: ServicoUi): void {
    this.state.openModal(servico);
  }

  fecharModal(): void {
    this.state.closeModal();
  }

  salvar(data: ServicoFormData, id?: string): void {
    this.state.setSaving(true);
    const request = id
      ? this.api.atualizar(id, data)
      : this.api.criar(data);

    request.subscribe({
      next: () => {
        this.state.setSaving(false);
        this.state.closeModal();
        this.toast.success(id ? 'Serviço atualizado com sucesso!' : 'Serviço criado com sucesso!');
        this.load();
      },
      error: (err: Error) => {
        this.state.setSaving(false);
        this.toast.error(err.message ?? 'Erro ao salvar serviço.');
      },
    });
  }

  toggleAtivo(servico: ServicoUi): void {
    const request = servico.ativo
      ? this.api.inativar(servico.id)
      : this.api.reativar(servico.id);

    request.subscribe({
      next: () => {
        this.toast.success(servico.ativo ? 'Serviço desativado.' : 'Serviço ativado.');
        this.load();
      },
      error: (err: Error) => {
        this.toast.error(err.message ?? 'Erro ao alterar status do serviço.');
      },
    });
  }

  excluir(servico: ServicoUi): void {
    if (!confirm(`Deseja realmente excluir o serviço "${servico.nome}"?`)) {
      return;
    }

    this.api.excluir(servico.id).subscribe({
      next: () => {
        this.toast.success('Serviço excluído com sucesso!');
        this.load();
      },
      error: (err: Error) => {
        this.toast.error(err.message ?? 'Erro ao excluir o serviço.');
      },
    });
  }
}
