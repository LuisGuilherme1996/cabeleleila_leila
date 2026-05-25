import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AgendarApi } from './api/agendar.api';
import { AgendarAdapter, ServicoWizardUi } from './adapter/agendar.adapter';
import { AgendarState } from './state/agendar.state';

@Injectable()
export class AgendarFacade {
  private readonly api = inject(AgendarApi);
  private readonly adapter = inject(AgendarAdapter);
  private readonly state = inject(AgendarState);
  private readonly router = inject(Router);

  readonly step$ = this.state.step$;
  readonly servicos$ = this.state.servicos$;
  readonly servico$ = this.state.servico$;
  readonly data$ = this.state.data$;
  readonly horario$ = this.state.horario$;
  readonly slots$ = this.state.slots$;
  readonly loading$ = this.state.loading$;
  readonly loadingSlots$ = this.state.loadingSlots$;
  readonly submitting$ = this.state.submitting$;
  readonly error$ = this.state.error$;

  loadServicos(preSelectedId?: string): void {
    this.state.setLoading(true);
    this.state.setError(null);
    this.api.getServicos().subscribe({
      next: (raw) => {
        const list = this.adapter.toServicoWizardList(raw);
        this.state.setServicos(list);
        this.state.setLoading(false);
        if (preSelectedId) {
          const found = list.find((s) => s.id === preSelectedId);
          if (found) this.selecionarServico(found);
        }
      },
      error: (err: Error) => {
        this.state.setError(err.message ?? 'Erro ao carregar serviços.');
        this.state.setLoading(false);
      },
    });
  }

  selecionarServico(servico: ServicoWizardUi): void {
    this.state.setServico(servico);
    this.state.setData(null);
    this.state.setHorario(null);
    this.state.setSlots([]);
    this.state.setStep(2);
  }

  selecionarData(data: string): void {
    const servico = this.state.servico$ as never;
    // get snapshot via BehaviorSubject trick through observable
    this.state.setData(data);
    this.state.setHorario(null);
    this.state.setStep(3);
    this.loadSlots(data);
  }

  private loadSlots(data: string): void {
    // Access servico from state observable snapshot
    let servicoId: string | null = null;
    this.state.servico$.subscribe((s) => (servicoId = s?.id ?? null)).unsubscribe();
    if (!servicoId) return;

    this.state.setLoadingSlots(true);
    this.state.setError(null);
    this.api.getDisponibilidade(data, servicoId).subscribe({
      next: (raw) => {
        this.state.setSlots(this.adapter.toSlotList(raw));
        this.state.setLoadingSlots(false);
      },
      error: (err: Error) => {
        this.state.setError(err.message ?? 'Erro ao carregar horários.');
        this.state.setLoadingSlots(false);
      },
    });
  }

  selecionarHorario(horario: string): void {
    this.state.setHorario(horario);
    this.state.setStep(4);
  }

  confirmar(observacao: string): void {
    let servicoId: string | null = null;
    let data: string | null = null;
    let horario: string | null = null;

    this.state.servico$.subscribe((s) => (servicoId = s?.id ?? null)).unsubscribe();
    this.state.data$.subscribe((d) => (data = d)).unsubscribe();
    this.state.horario$.subscribe((h) => (horario = h)).unsubscribe();

    if (!servicoId || !data || !horario) return;

    const dataHora = new Date(`${data}T${horario}:00`).toISOString();

    this.state.setSubmitting(true);
    this.state.setError(null);
    this.api.criarAgendamento({ servicoId, dataHora, observacoes: observacao || undefined }).subscribe({
      next: () => {
        this.state.setSubmitting(false);
        this.state.setStep('sucesso');
      },
      error: (err: unknown) => {
        const message =
          err instanceof HttpErrorResponse
            ? err.error?.message ?? err.message
            : (err as Error).message;
        this.state.setSubmitting(false);
        this.state.setError(message ?? 'Erro ao confirmar agendamento.');
        // Se o horário já foi ocupado (conflito), volta pro step de seleção de
        // horário e recarrega os slots para mostrar a disponibilidade atual
        if (message?.toLowerCase().includes('já está ocupado') || message?.toLowerCase().includes('conflict')) {
          this.state.setStep(3);
          if (data) this.loadSlots(data);
        }
      },
    });
  }

  voltar(): void {
    const current = this.state.stepSnapshot;
    if (current === 2) this.state.setStep(1);
    else if (current === 3) this.state.setStep(2);
    else if (current === 4) this.state.setStep(3);
  }

  irParaMeusAgendamentos(): void {
    this.state.reset();
    this.router.navigate(['/meus-agendamentos']);
  }
}
