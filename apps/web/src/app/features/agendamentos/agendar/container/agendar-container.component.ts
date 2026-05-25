import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AgendarFacade } from '../agendar.facade';
import { AgendarState } from '../state/agendar.state';
import { StepServicoComponent } from '../components/step-servico/step-servico.component';
import { StepDataComponent } from '../components/step-data/step-data.component';
import { StepHorarioComponent } from '../components/step-horario/step-horario.component';
import { StepResumoComponent } from '../components/step-resumo/step-resumo.component';
import { StepSucessoComponent } from '../components/step-sucesso/step-sucesso.component';
import { ServicoWizardUi } from '../adapter/agendar.adapter';
import { ConfirmarPayload } from '../components/step-resumo/step-resumo.component';

@Component({
  selector: 'app-agendar-container',
  standalone: true,
  templateUrl: './agendar-container.component.html',
  imports: [
    AsyncPipe,
    StepServicoComponent,
    StepDataComponent,
    StepHorarioComponent,
    StepResumoComponent,
    StepSucessoComponent,
  ],
  providers: [AgendarFacade, AgendarState],
})
export class AgendarContainerComponent implements OnInit {
  protected readonly facade = inject(AgendarFacade);
  private readonly route = inject(ActivatedRoute);

  readonly step$ = this.facade.step$;
  readonly servicos$ = this.facade.servicos$;
  readonly servico$ = this.facade.servico$;
  readonly data$ = this.facade.data$;
  readonly horario$ = this.facade.horario$;
  readonly slots$ = this.facade.slots$;
  readonly loading$ = this.facade.loading$;
  readonly loadingSlots$ = this.facade.loadingSlots$;
  readonly submitting$ = this.facade.submitting$;
  readonly error$ = this.facade.error$;

  ngOnInit(): void {
    const servicoId = this.route.snapshot.queryParamMap.get('servicoId') ?? undefined;
    this.facade.loadServicos(servicoId);
  }

  protected onServicoSelecionado(servico: ServicoWizardUi): void {
    this.facade.selecionarServico(servico);
  }

  protected onDataSelecionada(data: string): void {
    this.facade.selecionarData(data);
  }

  protected onHorarioSelecionado(horario: string): void {
    this.facade.selecionarHorario(horario);
  }

  protected onConfirmar(payload: ConfirmarPayload): void {
    this.facade.confirmar(payload.observacao);
  }

  protected onVoltar(): void {
    this.facade.voltar();
  }

  protected onIrMeusAgendamentos(): void {
    this.facade.irParaMeusAgendamentos();
  }

  /** Returns the numeric step (0 for 'sucesso') for template comparisons */
  protected stepNum(step: unknown): number {
    return typeof step === 'number' ? step : 0;
  }
}
