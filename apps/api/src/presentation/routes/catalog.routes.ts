import { Router } from 'express';
import { z } from 'zod';
import { CatalogController } from '../controllers/catalog.controller.js';

// ── Use Cases ────────────────────────────────────────────────────────────────
import { CriarServicoUseCase } from '../../application/use-cases/catalog/criar-servico.use-case.js';
import { ListarServicosUseCase } from '../../application/use-cases/catalog/listar-servicos.use-case.js';
import { ObterServicoUseCase } from '../../application/use-cases/catalog/obter-servico.use-case.js';
import { AtualizarServicoUseCase } from '../../application/use-cases/catalog/atualizar-servico.use-case.js';
import { InativarServicoUseCase } from '../../application/use-cases/catalog/inativar-servico.use-case.js';
import { ReativarServicoUseCase } from '../../application/use-cases/catalog/reativar-servico.use-case.js';
import { ExcluirServicoUseCase } from '../../application/use-cases/catalog/excluir-servico.use-case.js';
import { SalvarHorarioFuncionamentoUseCase } from '../../application/use-cases/catalog/salvar-horario-funcionamento.use-case.js';
import { ListarHorariosFuncionamentoUseCase } from '../../application/use-cases/catalog/listar-horarios-funcionamento.use-case.js';
import { CriarBloqueioAgendaUseCase } from '../../application/use-cases/catalog/criar-bloqueio-agenda.use-case.js';
import { ListarBloqueiosAgendaUseCase } from '../../application/use-cases/catalog/listar-bloqueios-agenda.use-case.js';
import { RemoverBloqueioAgendaUseCase } from '../../application/use-cases/catalog/remover-bloqueio-agenda.use-case.js';
import { ListarDisponibilidadeUseCase } from '../../application/use-cases/catalog/listar-disponibilidade.use-case.js';

// ── Infrastructure ───────────────────────────────────────────────────────────
import { PgServicoRepository } from '../../infrastructure/repositories/pg-servico.repository.js';
import { PgHorarioFuncionamentoRepository } from '../../infrastructure/repositories/pg-horario-funcionamento.repository.js';
import { PgBloqueioAgendaRepository } from '../../infrastructure/repositories/pg-bloqueio-agenda.repository.js';
import { PgAgendamentoRepository } from '../../infrastructure/repositories/pg-agendamento.repository.js';

// ── Middlewares ───────────────────────────────────────────────────────────────
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleMiddleware } from '../middlewares/role.middleware.js';
import { validateRequest } from '../middlewares/validate.middleware.js';

// ── DTOs/Schemas ──────────────────────────────────────────────────────────────
import {
  criarServicoSchema,
  atualizarServicoSchema,
} from '../../application/dtos/catalog/servico.dto.js';
import { salvarHorarioFuncionamentoSchema } from '../../application/dtos/catalog/horario-funcionamento.dto.js';
import { criarBloqueioAgendaSchema } from '../../application/dtos/catalog/bloqueio-agenda.dto.js';
import { listarDisponibilidadeSchema } from '../../application/dtos/catalog/disponibilidade.dto.js';

// ── Composition Root ─────────────────────────────────────────────────────────
const servicoRepo = new PgServicoRepository();
const horarioRepo = new PgHorarioFuncionamentoRepository();
const bloqueioRepo = new PgBloqueioAgendaRepository();
const agendamentoRepo = new PgAgendamentoRepository();

const controller = new CatalogController(
  new CriarServicoUseCase(servicoRepo),
  new ListarServicosUseCase(servicoRepo),
  new ObterServicoUseCase(servicoRepo),
  new AtualizarServicoUseCase(servicoRepo),
  new InativarServicoUseCase(servicoRepo),
  new ReativarServicoUseCase(servicoRepo),
  new ExcluirServicoUseCase(servicoRepo),
  new SalvarHorarioFuncionamentoUseCase(horarioRepo),
  new ListarHorariosFuncionamentoUseCase(horarioRepo),
  new CriarBloqueioAgendaUseCase(bloqueioRepo),
  new ListarBloqueiosAgendaUseCase(bloqueioRepo),
  new RemoverBloqueioAgendaUseCase(bloqueioRepo),
  new ListarDisponibilidadeUseCase(servicoRepo, horarioRepo, bloqueioRepo, agendamentoRepo),
);

// ── Routes ────────────────────────────────────────────────────────────────────
const catalogRouter = Router();

// Serviços — público (lista/obtém serviços ativos); escrita restrita a ADMIN
catalogRouter.get('/servicos', authMiddleware, controller.listarServicos);
catalogRouter.get(
  '/servicos/:id',
  validateRequest(z.object({ params: z.object({ id: z.string().uuid() }) })),
  controller.obterServico,
);
catalogRouter.post(
  '/servicos',
  authMiddleware,
  roleMiddleware('ADMIN'),
  validateRequest(z.object({ body: criarServicoSchema })),
  controller.criarServico,
);
catalogRouter.put(
  '/servicos/:id',
  authMiddleware,
  roleMiddleware('ADMIN'),
  validateRequest(
    z.object({ params: z.object({ id: z.string().uuid() }), body: atualizarServicoSchema }),
  ),
  controller.atualizarServico,
);
catalogRouter.patch(
  '/servicos/:id/inativar',
  authMiddleware,
  roleMiddleware('ADMIN'),
  validateRequest(z.object({ params: z.object({ id: z.string().uuid() }) })),
  controller.inativarServico,
);
catalogRouter.patch(
  '/servicos/:id/reativar',
  authMiddleware,
  roleMiddleware('ADMIN'),
  validateRequest(z.object({ params: z.object({ id: z.string().uuid() }) })),
  controller.reativarServico,
);
catalogRouter.delete(
  '/servicos/:id',
  authMiddleware,
  roleMiddleware('ADMIN'),
  validateRequest(z.object({ params: z.object({ id: z.string().uuid() }) })),
  controller.excluirServico,
);

// Horários de Funcionamento — restrito a ADMIN
catalogRouter.get(
  '/horarios',
  authMiddleware,
  roleMiddleware('ADMIN'),
  controller.listarHorariosFuncionamento,
);
catalogRouter.put(
  '/horarios',
  authMiddleware,
  roleMiddleware('ADMIN'),
  validateRequest(z.object({ body: salvarHorarioFuncionamentoSchema })),
  controller.salvarHorarioFuncionamento,
);

// Bloqueios de Agenda — restrito a ADMIN
catalogRouter.get(
  '/bloqueios',
  authMiddleware,
  roleMiddleware('ADMIN'),
  controller.listarBloqueiosAgenda,
);
catalogRouter.post(
  '/bloqueios',
  authMiddleware,
  roleMiddleware('ADMIN'),
  validateRequest(z.object({ body: criarBloqueioAgendaSchema })),
  controller.criarBloqueioAgenda,
);
catalogRouter.delete(
  '/bloqueios/:id',
  authMiddleware,
  roleMiddleware('ADMIN'),
  validateRequest(z.object({ params: z.object({ id: z.string().uuid() }) })),
  controller.removerBloqueioAgenda,
);

// Disponibilidade — público (sem autenticação)
catalogRouter.get(
  '/disponibilidade',
  validateRequest(z.object({ query: listarDisponibilidadeSchema })),
  controller.listarDisponibilidade,
);

export { catalogRouter };
