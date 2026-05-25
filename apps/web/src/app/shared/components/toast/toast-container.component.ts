import { Component, inject } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  template: `
    <div
      class="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none"
      aria-live="polite"
      aria-label="Notificações"
    >
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          role="alert"
          [class]="toastClass(toast.type)"
        >
          <span class="text-sm font-medium">{{ toast.message }}</span>
          <button
            type="button"
            (click)="toastService.dismiss(toast.id)"
            class="ml-4 shrink-0 opacity-70 hover:opacity-100 transition-opacity pointer-events-auto"
            aria-label="Fechar notificação"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastContainerComponent {
  protected readonly toastService = inject(ToastService);

  toastClass(type: string): string {
    const base =
      'flex items-center justify-between px-4 py-3 rounded-[var(--radius-md)] shadow-lg ' +
      'min-w-[260px] max-w-sm pointer-events-auto animate-in slide-in-from-right-4';
    const variants: Record<string, string> = {
      success:
        'bg-emerald-600 text-white border border-emerald-500',
      error:
        'bg-red-600 text-white border border-red-500',
      info:
        'bg-[var(--color-surface-dark-elevated)] text-[var(--color-on-dark)] border border-[var(--color-hairline-dark)]',
    };
    return `${base} ${variants[type] ?? variants['info']}`;
  }
}
