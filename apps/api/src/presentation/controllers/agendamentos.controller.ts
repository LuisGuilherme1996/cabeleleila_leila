import { Request, Response, NextFunction } from 'express';
import type { CriarAgendamentoUseCase } from '../../application/use-cases/agendamentos/criar-agendamento.use-case.js';
import type { ListarAgendamentosUseCase } from '../../application/use-cases/agendamentos/listar-agendamentos.use-case.js';
import type { CancelarAgendamentoUseCase } from '../../application/use-cases/agendamentos/cancelar-agendamento.use-case.js';
import type { ConfirmarAgendamentoUseCase } from '../../application/use-cases/agendamentos/confirmar-agendamento.use-case.js';
import type { ConcluirAgendamentoUseCase } from '../../application/use-cases/agendamentos/concluir-agendamento.use-case.js';
import type { DashboardAdminUseCase } from '../../application/use-cases/agendamentos/dashboard-admin.use-case.js';
import type { ListarUsuariosAdminUseCase } from '../../application/use-cases/users/listar-usuarios-admin.use-case.js';

export class AgendamentosController {
  constructor(
    private readonly criarAgendamentoUseCase: CriarAgendamentoUseCase,
    private readonly listarAgendamentosUseCase: ListarAgendamentosUseCase,
    private readonly cancelarAgendamentoUseCase: CancelarAgendamentoUseCase,
    private readonly confirmarAgendamentoUseCase: ConfirmarAgendamentoUseCase,
    private readonly concluirAgendamentoUseCase: ConcluirAgendamentoUseCase,
    private readonly dashboardAdminUseCase: DashboardAdminUseCase,
    private readonly listarUsuariosAdminUseCase: ListarUsuariosAdminUseCase,
  ) {}

  criar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Administradores não devem criar agendamentos para si mesmos
      const isAdmin = req.user!.perfis.includes('ADMIN');
      if (isAdmin) {
        res.status(403).json({
          status: 'error',
          message: 'Administradores não podem criar agendamentos. Gerencie os agendamentos pelo painel administrativo.',
        });
        return;
      }

      const data = await this.criarAgendamentoUseCase.execute({
        clienteId: req.user!.sub,
        servicoId: req.body.servicoId,
        dataHora: req.body.dataHora,
        observacoes: req.body.observacoes,
      });
      res.status(201).json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  };

  listar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const isAdmin = req.user!.perfis.includes('ADMIN');
      const clienteId = isAdmin ? undefined : req.user!.sub;
      const data = await this.listarAgendamentosUseCase.execute(req.query as never, clienteId);
      res.status(200).json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  };

  cancelar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const isAdmin = req.user!.perfis.includes('ADMIN');
      const data = await this.cancelarAgendamentoUseCase.execute(
        req.params.id,
        req.user!.sub,
        isAdmin,
      );
      res.status(200).json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  };

  confirmar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.confirmarAgendamentoUseCase.execute(req.params.id);
      res.status(200).json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  };

  concluir = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.concluirAgendamentoUseCase.execute(req.params.id);
      res.status(200).json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  };

  dashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.dashboardAdminUseCase.execute();
      res.status(200).json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  };

  listarUsuarios = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const busca = typeof req.query.busca === 'string' ? req.query.busca : undefined;
      const data = await this.listarUsuariosAdminUseCase.execute(busca);
      res.status(200).json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  };
}
