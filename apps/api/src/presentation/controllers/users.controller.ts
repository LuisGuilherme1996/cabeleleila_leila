import { Request, Response, NextFunction } from 'express';
import type { ObterPerfilUseCase } from '../../application/use-cases/users/obter-perfil.use-case.js';
import type { AtualizarPerfilUseCase } from '../../application/use-cases/users/atualizar-perfil.use-case.js';
import { DomainError } from '../../domain/errors/domain.error.js';

export class UsersController {
  constructor(
    private readonly obterPerfilUseCase: ObterPerfilUseCase,
    private readonly atualizarPerfilUseCase: AtualizarPerfilUseCase,
  ) {}

  obterPerfil = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new DomainError('Autenticação necessária.', 401);
      }

      const output = await this.obterPerfilUseCase.execute(req.user.sub);
      res.status(200).json({ status: 'success', data: output });
    } catch (error) {
      next(error);
    }
  };

  atualizarPerfil = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new DomainError('Autenticação necessária.', 401);
      }

      const output = await this.atualizarPerfilUseCase.execute(req.user.sub, req.body);
      res.status(200).json({ status: 'success', data: output });
    } catch (error) {
      next(error);
    }
  };
}
