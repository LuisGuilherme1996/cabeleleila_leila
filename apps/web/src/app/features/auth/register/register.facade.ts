import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { RegisterApi, RegisterRequestDto } from './api/register.api';
import { RegisterAdapter } from './adapter/register.adapter';
import { RegisterState } from './state/register.state';

@Injectable()
export class RegisterFacade {
  private readonly api = inject(RegisterApi);
  private readonly adapter = inject(RegisterAdapter);
  private readonly state = inject(RegisterState);
  private readonly router = inject(Router);

  readonly loading$ = this.state.loading$;
  readonly error$ = this.state.error$;
  readonly success$ = this.state.success$;

  register(payload: RegisterRequestDto): void {
    this.state.setLoading(true);
    this.state.setError(null);
    this.api.register(payload).subscribe({
      next: (raw) => {
        this.adapter.toUi(raw);
        this.state.setLoading(false);
        this.state.setSuccess(true);
        // Redirect to /login after 5 seconds as per G-2 acceptance criteria
        setTimeout(() => this.router.navigate(['/login']), 5000);
      },
      error: (err: Error) => {
        this.state.setError(err.message ?? 'Erro ao criar conta. Tente novamente.');
        this.state.setLoading(false);
      },
    });
  }
}
