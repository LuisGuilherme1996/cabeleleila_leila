import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthStore } from '../../../store/auth.store';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.component.html',
})
export class LayoutComponent {
  private readonly router = inject(Router);
  readonly authStore = inject(AuthStore);

  /** Controls mobile sidebar visibility */
  readonly sidebarOpen = signal(false);

  readonly isLoggedIn = computed(() => this.authStore.isLoggedIn());
  readonly isAdmin = computed(() => this.authStore.isAdmin());
  readonly userName = computed(() => this.authStore.currentUser()?.name ?? '');

  toggleSidebar(): void {
    this.sidebarOpen.update((v) => !v);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  logout(): void {
    this.authStore.clearAuth();
    this.router.navigate(['/login']);
  }
}
