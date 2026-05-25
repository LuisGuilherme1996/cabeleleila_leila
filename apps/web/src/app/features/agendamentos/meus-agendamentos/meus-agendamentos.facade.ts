import { inject, Injectable } from '@angular/core';
import { combineLatest, map } from 'rxjs';
import { MeusAgendamentosApi } from './api/meus-agendamentos.api';
import { MeusAgendamentosAdapter } from './adapter/meus-agendamentos.adapter';
import { MeusAgendamentosState, AbaAtiva } from './state/meus-agendamentos.state';

@Injectable()
export class MeusAgendamentosFacade {
  private readonly api = inject(MeusAgendamentosApi);
  private readonly adapter = inject(MeusAgendamentosAdapter);
  private readonly state = inject(MeusAgendamentosState);

  readonly loading$ = this.state.loading$;
  readonly error$ = this.state.error$;
  readonly abaAtiva$ = this.state.abaAtiva$;
  readonly cancelandoId$ = this.state.cancelandoId$;

  readonly proximos$ = this.state.agendamentos$.pipe(
    map((list) =>
      list
        .filter((a) => a.status === 'PENDENTE' || a.status === 'CONFIRMADO')
        .sort((a, b) => a.dataHoraRaw.getTime() - b.dataHoraRaw.getTime()),
    ),
  );

  readonly historico$ = this.state.agendamentos$.pipe(
    map((list) =>
      list
        .filter((a) => a.status === 'CONCLUIDO' || a.status === 'CANCELADO')
        .sort((a, b) => b.dataHoraRaw.getTime() - a.dataHoraRaw.getTime()),
    ),
  );

  readonly listaAtiva$ = combineLatest([this.proximos$, this.historico$, this.abaAtiva$]).pipe(
    map(([proximos, historico, aba]) => (aba === 'proximos' ? proximos : historico)),
  );

  loadAgendamentos(): void {
    this.state.setLoading(true);
    this.state.setError(null);
    this.api.getMeusAgendamentos().subscribe({
      next: (raw) => {
        this.state.setAgendamentos(this.adapter.toUiList(raw));
        this.state.setLoading(false);
      },
      error: (err: Error) => {
        this.state.setError(err.message ?? 'Erro ao carregar agendamentos.');
        this.state.setLoading(false);
      },
    });
  }

  setAba(aba: AbaAtiva): void {
    this.state.setAbaAtiva(aba);
  }

  abrirModalCancelar(id: string): void {
    this.state.setError(null);
    this.state.setCancelandoId(id);
  }

  fecharModalCancelar(): void {
    this.state.setCancelandoId(null);
  }

  confirmarCancelamento(): void {
    let id: string | null = null;
    this.state.cancelandoId$.subscribe((v) => (id = v)).unsubscribe();
    if (!id) return;

    this.state.setCancelandoId(null);
    this.api.cancelarAgendamento(id).subscribe({
      next: () => this.loadAgendamentos(),
      error: (err: Error) => this.state.setError(err.message ?? 'Erro ao cancelar agendamento.'),
    });
  }
}
