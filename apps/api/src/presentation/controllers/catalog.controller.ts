import { Request, Response, NextFunction } from 'express';
import type { CriarServicoUseCase } from '../../application/use-cases/catalog/criar-servico.use-case.js';
import type { ListarServicosUseCase } from '../../application/use-cases/catalog/listar-servicos.use-case.js';
import type { ObterServicoUseCase } from '../../application/use-cases/catalog/obter-servico.use-case.js';
import type { AtualizarServicoUseCase } from '../../application/use-cases/catalog/atualizar-servico.use-case.js';
import type { InativarServicoUseCase } from '../../application/use-cases/catalog/inativar-servico.use-case.js';
import type { ReativarServicoUseCase } from '../../application/use-cases/catalog/reativar-servico.use-case.js';
import type { ExcluirServicoUseCase } from '../../application/use-cases/catalog/excluir-servico.use-case.js';
import type { SalvarHorarioFuncionamentoUseCase } from '../../application/use-cases/catalog/salvar-horario-funcionamento.use-case.js';
import type { ListarHorariosFuncionamentoUseCase } from '../../application/use-cases/catalog/listar-horarios-funcionamento.use-case.js';
import type { CriarBloqueioAgendaUseCase } from '../../application/use-cases/catalog/criar-bloqueio-agenda.use-case.js';
import type { ListarBloqueiosAgendaUseCase } from '../../application/use-cases/catalog/listar-bloqueios-agenda.use-case.js';
import type { RemoverBloqueioAgendaUseCase } from '../../application/use-cases/catalog/remover-bloqueio-agenda.use-case.js';
import type { ListarDisponibilidadeUseCase } from '../../application/use-cases/catalog/listar-disponibilidade.use-case.js';

export class CatalogController {
  constructor(
    private readonly criarServicoUseCase: CriarServicoUseCase,
    private readonly listarServicosUseCase: ListarServicosUseCase,
    private readonly obterServicoUseCase: ObterServicoUseCase,
    private readonly atualizarServicoUseCase: AtualizarServicoUseCase,
    private readonly inativarServicoUseCase: InativarServicoUseCase,
    private readonly reativarServicoUseCase: ReativarServicoUseCase,
    private readonly excluirServicoUseCase: ExcluirServicoUseCase,
    private readonly salvarHorarioFuncionamentoUseCase: SalvarHorarioFuncionamentoUseCase,
    private readonly listarHorariosFuncionamentoUseCase: ListarHorariosFuncionamentoUseCase,
    private readonly criarBloqueioAgendaUseCase: CriarBloqueioAgendaUseCase,
    private readonly listarBloqueiosAgendaUseCase: ListarBloqueiosAgendaUseCase,
    private readonly removerBloqueioAgendaUseCase: RemoverBloqueioAgendaUseCase,
    private readonly listarDisponibilidadeUseCase: ListarDisponibilidadeUseCase,
  ) {}

  // ── Serviços ─────────────────────────────────────────────────────────────────

  listarServicos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const isAdmin = req.user?.perfis.includes('ADMIN') ?? false;
      const data = await this.listarServicosUseCase.execute(!isAdmin);
      res.status(200).json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  };

  criarServico = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.criarServicoUseCase.execute(req.body);
      res.status(201).json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  };

  obterServico = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.obterServicoUseCase.execute(req.params.id);
      res.status(200).json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  };

  atualizarServico = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.atualizarServicoUseCase.execute(req.params.id, req.body);
      res.status(200).json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  };

  inativarServico = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.inativarServicoUseCase.execute(req.params.id);
      res.status(200).json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  };

  reativarServico = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.reativarServicoUseCase.execute(req.params.id);
      res.status(200).json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  };

  excluirServico = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.excluirServicoUseCase.execute(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  // ── Horários de Funcionamento ─────────────────────────────────────────────────

  listarHorariosFuncionamento = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const data = await this.listarHorariosFuncionamentoUseCase.execute();
      res.status(200).json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  };

  salvarHorarioFuncionamento = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const data = await this.salvarHorarioFuncionamentoUseCase.execute(req.body);
      res.status(200).json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  };

  // ── Bloqueios de Agenda ───────────────────────────────────────────────────────

  listarBloqueiosAgenda = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const data = await this.listarBloqueiosAgendaUseCase.execute();
      res.status(200).json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  };

  criarBloqueioAgenda = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const data = await this.criarBloqueioAgendaUseCase.execute(req.body);
      res.status(201).json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  };

  removerBloqueioAgenda = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      await this.removerBloqueioAgendaUseCase.execute(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  // ── Disponibilidade ───────────────────────────────────────────────────────────

  listarDisponibilidade = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const data = await this.listarDisponibilidadeUseCase.execute({
        data: req.query.data as string,
        servico_id: req.query.servico_id as string,
      });
      res.status(200).json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  };
}
