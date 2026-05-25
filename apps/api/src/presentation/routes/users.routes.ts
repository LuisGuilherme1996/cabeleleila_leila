import { Router } from 'express';
import { z } from 'zod';
import { UsersController } from '../controllers/users.controller.js';
import { ObterPerfilUseCase } from '../../application/use-cases/users/obter-perfil.use-case.js';
import { AtualizarPerfilUseCase } from '../../application/use-cases/users/atualizar-perfil.use-case.js';
import { PgUsuarioRepository } from '../../infrastructure/repositories/pg-usuario.repository.js';
import { PgPerfilRepository } from '../../infrastructure/repositories/pg-perfil.repository.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
import { atualizarPerfilSchema } from '../../application/dtos/users/atualizar-perfil.dto.js';

// ── Composition Root ────────────────────────────────────────────────────────
const usuarioRepo = new PgUsuarioRepository();
const perfilRepo = new PgPerfilRepository();

const controller = new UsersController(
  new ObterPerfilUseCase(usuarioRepo, perfilRepo),
  new AtualizarPerfilUseCase(usuarioRepo, perfilRepo),
);

// ── Routes ───────────────────────────────────────────────────────────────────
const usersRouter = Router();

usersRouter.get('/me', authMiddleware, controller.obterPerfil);

usersRouter.patch(
  '/me',
  authMiddleware,
  validateRequest(z.object({ body: atualizarPerfilSchema })),
  controller.atualizarPerfil,
);

export { usersRouter };
