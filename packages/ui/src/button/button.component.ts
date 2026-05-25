import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button [type]="type" [disabled]="disabled" [class]="getButtonStyles()">
      <ng-content></ng-content>
    </button>
  `,
})
export class ButtonComponent {
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() variant: 'gold' | 'primary' | 'secondary' | 'danger' = 'gold';
  @Input() disabled: boolean = false;

  getButtonStyles(): string {
    const base =
      'px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      gold: 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white shadow-amber-500/20 focus:ring-amber-500',
      primary:
        'bg-[var(--color-primary)] hover:bg-[var(--color-primary-pressed)] text-white shadow-[var(--color-primary)]/20 focus:ring-[var(--color-primary)]',
      secondary:
        'bg-slate-800 hover:bg-slate-700 text-slate-200 focus:ring-slate-500 shadow-none border border-slate-700',
      danger: 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/20 focus:ring-red-500',
    };

    return `${base} ${variants[this.variant]}`;
  }
}
