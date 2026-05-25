import { Router } from 'express';
import { z } from 'zod';

// ── Use Cases ────────────────────────────────────────────────────────────────
import { CriarAgendamentoUseCase } from '../../application/use-cases/agendamentos/criar-agendamento.use-case.js';
import { ListarAgendamentosUseCase } from '../../application/use-cases/agendamentos/listar-agendamentos.use-case.js';
import { CancelarAgendamentoUseCase } from '../../application/use-cases/agendamentos/cancelar-agendamento.use-case.js';
import { ConfirmarAgendamentoUseCase } from '../../application/use-cases/agendamentos/confirmar-agendamento.use-case.js';
import { ConcluirAgendamentoUseCase } from '../../application/use-cases/agendamentos/concluir-agendamento.use-case.js';
import { DashboardAdminUseCase } from '../../application/use-cases/agendamentos/dashboard-admin.use-case.js';
import { ListarUsuariosAdminUseCase } from '../../application/use-cases/users/listar-usuarios-admin.use-case.js';

// ── Infrastructure ───────────────────────────────────────────────────────────
import { PgAgendamentoRepository } from '../../infrastructure/repositories/pg-agendamento.repository.js';
import { PgServicoRepository } from '../../infrastructure/repositories/pg-servico.repository.js';
import { PgUsuarioRepository } from '../../infrastructure/repositories/pg-usuario.repository.js';
import { PgHorarioFuncionamentoRepository } from '../../infrastructure/repositories/pg-horario-funcionamento.repository.js';
import { PgBloqueioAgendaRepository } from '../../infrastructure/repositories/pg-bloqueio-agenda.repository.js';

// ── Controller ───────────────────────────────────────────────────────────────
import { AgendamentosController } from '../controllers/agendamentos.controller.js';

// ── Middlewares ───────────────────────────────────────────────────────────────
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleMiddleware } from '../middlewares/role.middleware.js';
import { validateRequest } from '../middlewares/validate.middleware.js';

// ── DTOs/Schemas ──────────────────────────────────────────────────────────────
import {
  criarAgendamentoSchema,
  listarAgendamentosQuerySchema,
  agendamentoIdParamSchema,
} from '../../application/dtos/agendamentos/agendamento.dto.js';

// ── Composition Root ─────────────────────────────────────────────────────────
const agendamentoRepo = new PgAgendamentoRepository();
const servicoRepo = new PgServicoRepository();
const usuarioRepo = new PgUsuarioRepository();
const horarioRepo = new PgHorarioFuncionamentoRepository();
const bloqueioRepo = new PgBloqueioAgendaRepository();

const controller = new AgendamentosController(
  new CriarAgendamentoUseCase(agendamentoRepo, servicoRepo, horarioRepo, bloqueioRepo),
  new ListarAgendamentosUseCase(agendamentoRepo, servicoRepo),
  new CancelarAgendamentoUseCase(agendamentoRepo),
  new ConfirmarAgendamentoUseCase(agendamentoRepo),
  new ConcluirAgendamentoUseCase(agendamentoRepo),
  new DashboardAdminUseCase(agendamentoRepo),
  new ListarUsuariosAdminUseCase(usuarioRepo),
);

// ── Routes ────────────────────────────────────────────────────────────────────
const agendamentosRouter = Router();

// POST /agendamentos — any authenticated user (cliente creates their own appointment)
agendamentosRouter.post(
  '/',
  authMiddleware,
  validateRequest(z.object({ body: criarAgendamentoSchema })),
  controller.criar,
);

// GET /agendamentos — CLIENTE sees only own; ADMIN sees all
agendamentosRouter.get(
  '/',
  authMiddleware,
  validateRequest(z.object({ query: listarAgendamentosQuerySchema })),
  controller.listar,
);

// PATCH /agendamentos/:id/cancelar — owner or ADMIN
agendamentosRouter.patch(
  '/:id/cancelar',
  authMiddleware,
  validateRequest(z.object({ params: agendamentoIdParamSchema })),
  controller.cancelar,
);

// PATCH /agendamentos/:id/confirmar — ADMIN only
agendamentosRouter.patch(
  '/:id/confirmar',
  authMiddleware,
  roleMiddleware('ADMIN'),
  validateRequest(z.object({ params: agendamentoIdParamSchema })),
  controller.confirmar,
);

// PATCH /agendamentos/:id/concluir — ADMIN only
agendamentosRouter.patch(
  '/:id/concluir',
  authMiddleware,
  roleMiddleware('ADMIN'),
  validateRequest(z.object({ params: agendamentoIdParamSchema })),
  controller.concluir,
);

// GET /admin/dashboard — ADMIN only (mounted under /admin prefix via index.ts)
const adminRouter = Router();
adminRouter.get(
  '/dashboard',
  authMiddleware,
  roleMiddleware('ADMIN'),
  controller.dashboard,
);

// GET /admin/usuarios — ADMIN only
adminRouter.get(
  '/usuarios',
  authMiddleware,
  roleMiddleware('ADMIN'),
  controller.listarUsuarios,
);

export { agendamentosRouter, adminRouter };
