import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300"
          (click)="closeModal()"
        ></div>

        <!-- Modal Content Container -->
        <div
          [class]="
            'rounded-2xl shadow-2xl border max-w-lg w-full z-10 overflow-hidden transform scale-100 transition-all duration-300 flex flex-col ' +
            (theme === 'dark'
              ? 'bg-[var(--color-surface-dark-elevated)] border-[var(--color-hairline-dark)]'
              : 'bg-white border-slate-100')
          "
        >
          <!-- Header -->
          <div
            [class]="
              'px-6 py-4 border-b flex items-center justify-between ' +
              (theme === 'dark' ? 'border-[var(--color-hairline-dark)]' : 'border-slate-100')
            "
          >
            <h3
              [class]="
                'font-bold text-lg tracking-tight ' +
                (theme === 'dark' ? 'text-[var(--color-on-dark)]' : 'text-slate-900')
              "
            >
              {{ title }}
            </h3>
            <button
              (click)="closeModal()"
              [class]="
                'p-1.5 rounded-lg transition-colors cursor-pointer ' +
                (theme === 'dark'
                  ? 'text-[var(--color-on-dark-mute)] hover:text-white hover:bg-[var(--color-surface-dark-card)]'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50')
              "
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="p-6 overflow-y-auto">
            <ng-content></ng-content>
          </div>
        </div>
      </div>
    }
  `,
})
export class DialogComponent {
  @Input() isOpen: boolean = false;
  @Input() title: string = '';
  @Input() theme: 'light' | 'dark' = 'dark';
  @Output() close = new EventEmitter<void>();

  closeModal(): void {
    this.close.emit();
  }
}

