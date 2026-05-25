import { Router } from 'express';
import { healthRouter } from './health.routes.js';
import { authRouter } from './auth.routes.js';
import { usersRouter } from './users.routes.js';
import { catalogRouter } from './catalog.routes.js';
import { agendamentosRouter, adminRouter } from './agendamentos.routes.js';

const router = Router();

router.use('/health', healthRouter);
router.use('/api/health', healthRouter);

router.use('/api/auth', authRouter);
router.use('/api/users', usersRouter);
router.use('/api/catalog', catalogRouter);
router.use('/api/agendamentos', agendamentosRouter);
router.use('/api/admin', adminRouter);

export { router as appRouter };
