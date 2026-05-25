import { Component, computed, input, OnInit, output, signal } from '@angular/core';

interface CalendarDay {
  date: string; // YYYY-MM-DD
  day: number;
  isToday: boolean;
  isPast: boolean;
  isSunday: boolean;
  isCurrentMonth: boolean;
}

@Component({
  selector: 'app-step-data',
  standalone: true,
  templateUrl: './step-data.component.html',
})
export class StepDataComponent implements OnInit {
  readonly dataSelecionada = output<string>();
  readonly voltarClicado = output<void>();

  protected readonly hoje = new Date();
  protected readonly currentYear = signal(this.hoje.getFullYear());
  protected readonly currentMonth = signal(this.hoje.getMonth()); // 0-based

  protected readonly monthName = computed(() =>
    new Date(this.currentYear(), this.currentMonth(), 1).toLocaleString('pt-BR', {
      month: 'long',
      year: 'numeric',
    }),
  );

  protected readonly calendarDays = computed<CalendarDay[]>(() => {
    const year = this.currentYear();
    const month = this.currentMonth();
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayStr = this.toDateStr(this.hoje);

    const days: CalendarDay[] = [];

    // Pad with empty slots for alignment (week starts Monday)
    const offset = firstDay === 0 ? 6 : firstDay - 1;
    for (let i = 0; i < offset; i++) {
      const d = new Date(year, month, -offset + i + 1);
      days.push(this.buildDay(d, false, todayStr));
    }

    for (let d = 1; d <= daysInMonth; d++) {
      days.push(this.buildDay(new Date(year, month, d), true, todayStr));
    }

    return days;
  });

  readonly weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  ngOnInit(): void {
    // Start from current month
  }

  protected prevMonth(): void {
    const m = this.currentMonth();
    if (m === 0) {
      this.currentMonth.set(11);
      this.currentYear.update((y) => y - 1);
    } else {
      this.currentMonth.update((v) => v - 1);
    }
  }

  protected nextMonth(): void {
    const m = this.currentMonth();
    if (m === 11) {
      this.currentMonth.set(0);
      this.currentYear.update((y) => y + 1);
    } else {
      this.currentMonth.update((v) => v + 1);
    }
  }

  protected selectDay(day: CalendarDay): void {
    if (day.isPast || day.isSunday || !day.isCurrentMonth) return;
    this.dataSelecionada.emit(day.date);
  }

  private buildDay(d: Date, isCurrentMonth: boolean, todayStr: string): CalendarDay {
    const dateStr = this.toDateStr(d);
    const isPast = dateStr < todayStr;
    return {
      date: dateStr,
      day: d.getDate(),
      isToday: dateStr === todayStr,
      isPast,
      isSunday: d.getDay() === 0,
      isCurrentMonth,
    };
  }

  private toDateStr(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}
