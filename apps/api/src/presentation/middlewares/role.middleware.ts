import { Request, Response, NextFunction } from 'express';

export const roleMiddleware = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        status: 'fail',
        error: 'Unauthorized',
        message: 'Autenticação necessária.',
      });
      return;
    }

    const hasRole = req.user.perfis.some((perfil) => roles.includes(perfil));

    if (!hasRole) {
      res.status(403).json({
        status: 'fail',
        error: 'Forbidden',
        message: 'Acesso negado. Permissão insuficiente.',
      });
      return;
    }

    next();
  };
};
