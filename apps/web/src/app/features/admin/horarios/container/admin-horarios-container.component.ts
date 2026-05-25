import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { AdminHorariosFacade } from '../admin-horarios.facade';
import { AdminHorariosState } from '../state/admin-horarios.state';
import { SalvarHorarioPayload } from '../api/admin-horarios.api';
import { HorariosGradeComponent } from '../components/horarios-grade/horarios-grade.component';

@Component({
  selector: 'app-admin-horarios-container',
  standalone: true,
  templateUrl: './admin-horarios-container.component.html',
  imports: [AsyncPipe, HorariosGradeComponent],
  providers: [AdminHorariosFacade, AdminHorariosState],
})
export class AdminHorariosContainerComponent implements OnInit {
  protected readonly facade = inject(AdminHorariosFacade);

  readonly horarios$ = this.facade.horarios$;
  readonly loading$ = this.facade.loading$;
  readonly saving$ = this.facade.saving$;
  readonly error$ = this.facade.error$;

  ngOnInit(): void {
    this.facade.load();
  }

  onSalvarHorario(payload: SalvarHorarioPayload): void {
    this.facade.salvarHorario(payload);
  }
}
