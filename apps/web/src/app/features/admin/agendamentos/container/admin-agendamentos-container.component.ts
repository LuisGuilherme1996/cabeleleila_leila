import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminAgendamentosFacade } from '../admin-agendamentos.facade';
import { AdminAgendamentosState } from '../state/admin-agendamentos.state';
import { AgendamentosTableComponent } from '../components/agendamentos-table/agendamentos-table.component';

@Component({
  selector: 'app-admin-agendamentos-container',
  standalone: true,
  templateUrl: './admin-agendamentos-container.component.html',
  imports: [AsyncPipe, FormsModule, AgendamentosTableComponent],
  providers: [AdminAgendamentosFacade, AdminAgendamentosState],
})
export class AdminAgendamentosContainerComponent implements OnInit {
  protected readonly facade = inject(AdminAgendamentosFacade);

  readonly agendamentos$ = this.facade.agendamentos$;
  readonly loading$ = this.facade.loading$;
  readonly actionLoading$ = this.facade.actionLoading$;
  readonly error$ = this.facade.error$;
  readonly filtroStatus$ = this.facade.filtroStatus$;
  readonly filtroDataInicio$ = this.facade.filtroDataInicio$;
  readonly filtroDataFim$ = this.facade.filtroDataFim$;

  readonly statusOptions = [
    { value: '', label: 'Todos' },
    { value: 'PENDENTE', label: 'Pendente' },
    { value: 'CONFIRMADO', label: 'Confirmado' },
    { value: 'CONCLUIDO', label: 'Concluído' },
    { value: 'CANCELADO', label: 'Cancelado' },
  ];

  ngOnInit(): void {
    this.facade.load();
  }

  onFiltroStatusChange(value: string): void {
    this.facade.setFiltroStatus(value);
  }

  onFiltroDataInicioChange(value: string): void {
    this.facade.setFiltroDataInicio(value);
  }

  onFiltroDataFimChange(value: string): void {
    this.facade.setFiltroDataFim(value);
  }

  onConfirmar(id: string): void {
    this.facade.confirmar(id);
  }

  onConcluir(id: string): void {
    this.facade.concluir(id);
  }

  onCancelar(id: string): void {
    this.facade.cancelar(id);
  }
}
