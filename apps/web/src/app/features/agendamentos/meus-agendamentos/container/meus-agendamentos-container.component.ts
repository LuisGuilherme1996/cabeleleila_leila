import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MeusAgendamentosFacade } from '../meus-agendamentos.facade';
import { MeusAgendamentosState } from '../state/meus-agendamentos.state';
import { AgendamentoCardComponent } from '../components/agendamento-card/agendamento-card.component';
import { AbaAtiva } from '../state/meus-agendamentos.state';

@Component({
  selector: 'app-meus-agendamentos-container',
  standalone: true,
  templateUrl: './meus-agendamentos-container.component.html',
  imports: [AsyncPipe, RouterLink, AgendamentoCardComponent],
  providers: [MeusAgendamentosFacade, MeusAgendamentosState],
})
export class MeusAgendamentosContainerComponent implements OnInit {
  protected readonly facade = inject(MeusAgendamentosFacade);

  readonly loading$ = this.facade.loading$;
  readonly error$ = this.facade.error$;
  readonly abaAtiva$ = this.facade.abaAtiva$;
  readonly listaAtiva$ = this.facade.listaAtiva$;
  readonly proximos$ = this.facade.proximos$;
  readonly historico$ = this.facade.historico$;
  readonly cancelandoId$ = this.facade.cancelandoId$;

  ngOnInit(): void {
    this.facade.loadAgendamentos();
  }

  protected setAba(aba: AbaAtiva): void {
    this.facade.setAba(aba);
  }

  protected onSolicitarCancelamento(id: string): void {
    this.facade.abrirModalCancelar(id);
  }

  protected onFecharModal(): void {
    this.facade.fecharModalCancelar();
  }

  protected onConfirmarCancelamento(): void {
    this.facade.confirmarCancelamento();
  }
}
