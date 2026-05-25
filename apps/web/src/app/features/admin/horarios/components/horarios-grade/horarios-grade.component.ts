import { Component, input, output, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HorarioUi } from '../../adapter/admin-horarios.adapter';
import { SalvarHorarioPayload } from '../../api/admin-horarios.api';
import { ButtonComponent } from 'ui';

interface HorarioRow extends HorarioUi {
  horaInicioEdit: string;
  horaFimEdit: string;
  fechadoEdit: boolean;
  dirty: boolean;
}

@Component({
  selector: 'app-horarios-grade',
  standalone: true,
  imports: [FormsModule, ButtonComponent],
  templateUrl: './horarios-grade.component.html',
})
export class HorariosGradeComponent implements OnChanges {
  readonly horarios = input.required<HorarioUi[] | null>();
  readonly loading = input.required<boolean>();
  readonly saving = input.required<boolean>();

  readonly salvar = output<SalvarHorarioPayload>();

  rows: HorarioRow[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['horarios']) {
      const h = this.horarios();
      if (h) {
        this.rows = h.map((item) => ({
          ...item,
          horaInicioEdit: item.horaInicio,
          horaFimEdit: item.horaFim,
          fechadoEdit: item.fechado,
          dirty: false,
        }));
      }
    }
  }

  markDirty(row: HorarioRow): void {
    row.dirty = true;
  }

  onSalvar(row: HorarioRow): void {
    this.salvar.emit({
      diaSemana: row.diaSemana,
      horaInicio: row.horaInicioEdit,
      horaFim: row.horaFimEdit,
      fechado: row.fechadoEdit,
    });
    row.dirty = false;
  }
}
