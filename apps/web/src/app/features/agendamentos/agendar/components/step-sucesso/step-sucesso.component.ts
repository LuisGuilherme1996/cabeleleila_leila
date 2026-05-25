import { Component, OnInit, output } from '@angular/core';

@Component({
  selector: 'app-step-sucesso',
  standalone: true,
  templateUrl: './step-sucesso.component.html',
})
export class StepSucessoComponent implements OnInit {
  readonly novoAgendamento = output<void>();

  protected countdown = 3;
  private timer: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.timer = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(this.timer!);
        this.novoAgendamento.emit();
      }
    }, 1000);
  }
}
