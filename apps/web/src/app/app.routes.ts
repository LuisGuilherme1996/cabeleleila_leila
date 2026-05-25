import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { LayoutComponent } from './shared/components/layout/layout.component';

export const routes: Routes = [
  // ── Auth pages (no layout shell) ────────────────────────
  {
    path: 'login',
    title: 'Entrar — Cabeleleila Leila',
    loadChildren: () =>
      import('./features/auth/login/login.module').then((m) => m.LoginModule),
  },
  {
    path: 'cadastro',
    title: 'Criar Conta — Cabeleleila Leila',
    loadChildren: () =>
      import('./features/auth/register/register.module').then((m) => m.RegisterModule),
  },
  {
    path: 'esqueci-senha',
    title: 'Recuperar Senha — Cabeleleila Leila',
    loadChildren: () =>
      import('./features/auth/forgot-password/forgot-password.module').then(
        (m) => m.ForgotPasswordModule,
      ),
  },
  {
    path: 'redefinir-senha',
    title: 'Nova Senha — Cabeleleila Leila',
    loadChildren: () =>
      import('./features/auth/reset-password/reset-password.module').then(
        (m) => m.ResetPasswordModule,
      ),
  },
  {
    path: 'auth/google/callback',
    title: 'Login com Google — Cabeleleila Leila',
    loadChildren: () =>
      import('./features/auth/google-callback/google-callback.module').then(
        (m) => m.GoogleCallbackModule,
      ),
  },

  // ── Error pages (no layout shell) ───────────────────────
  {
    path: '403',
    title: 'Acesso Negado',
    loadChildren: () =>
      import('./features/errors/forbidden/forbidden.module').then((m) => m.ForbiddenModule),
  },

  // ── Public routes (layout shell) ────────────────────────
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        title: 'Cabeleleila Leila',
        loadChildren: () =>
          import('./features/home/home.module').then((m) => m.HomeModule),
      },
      {
        path: 'servicos',
        title: 'Serviços — Cabeleleila Leila',
        loadChildren: () =>
          import('./features/catalog/catalog.module').then((m) => m.CatalogModule),
      },
    ],
  },

  // ── Authenticated client routes (layout shell) ──────────
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'agendar',
        title: 'Novo Agendamento — Cabeleleila Leila',
        loadChildren: () =>
          import('./features/agendamentos/agendar/agendar.module').then((m) => m.AgendarModule),
      },
      {
        path: 'meus-agendamentos',
        title: 'Meus Agendamentos — Cabeleleila Leila',
        loadChildren: () =>
          import('./features/agendamentos/meus-agendamentos/meus-agendamentos.module').then(
            (m) => m.MeusAgendamentosModule,
          ),
      },
      {
        path: 'perfil',
        title: 'Meu Perfil — Cabeleleila Leila',
        loadChildren: () =>
          import('./features/perfil/perfil.module').then((m) => m.PerfilModule),
      },
    ],
  },

  // ── Admin routes (layout shell, ADMIN role required) ─────
  {
    path: 'admin',
    component: LayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { role: 'ADMIN' },
    children: [
      {
        path: '',
        title: 'Dashboard — Cabeleleila Leila Admin',
        loadChildren: () =>
          import('./features/admin/dashboard/admin-dashboard.module').then(
            (m) => m.AdminDashboardModule,
          ),
      },
      {
        path: 'agendamentos',
        title: 'Agendamentos — Admin',
        loadChildren: () =>
          import('./features/admin/agendamentos/admin-agendamentos.module').then(
            (m) => m.AdminAgendamentosModule,
          ),
      },
      {
        path: 'servicos',
        title: 'Serviços — Admin',
        loadChildren: () =>
          import('./features/admin/servicos/admin-servicos.module').then(
            (m) => m.AdminServicosModule,
          ),
      },
      {
        path: 'horarios',
        title: 'Horários — Admin',
        loadChildren: () =>
          import('./features/admin/horarios/admin-horarios.module').then(
            (m) => m.AdminHorariosModule,
          ),
      },
      {
        path: 'bloqueios',
        title: 'Bloqueios — Admin',
        loadChildren: () =>
          import('./features/admin/bloqueios/admin-bloqueios.module').then(
            (m) => m.AdminBloqueiosModule,
          ),
      },
      {
        path: 'usuarios',
        title: 'Usuários — Admin',
        loadChildren: () =>
          import('./features/admin/usuarios/admin-usuarios.module').then(
            (m) => m.AdminUsuariosModule,
          ),
      },
    ],
  },

  // ── Wildcard ─────────────────────────────────────────────
  {
    path: '**',
    title: 'Página não encontrada',
    loadChildren: () =>
      import('./features/errors/not-found/not-found.module').then((m) => m.NotFoundModule),
  },
];

