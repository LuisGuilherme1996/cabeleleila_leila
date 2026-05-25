import { Request, Response, NextFunction } from 'express';
import { JwtTokenService } from '../../infrastructure/security/jwt.service.js';
import { DomainError } from '../../domain/errors/domain.error.js';

const tokenService = new JwtTokenService();

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      status: 'fail',
      error: 'Unauthorized',
      message: 'Token de acesso não fornecido.',
    });
    return;
  }

  const token = authHeader.slice(7);

  try {
    req.user = tokenService.verifyAccess(token);
    next();
  } catch (error) {
    if (error instanceof DomainError) {
      res.status(401).json({
        status: 'fail',
        error: 'Unauthorized',
        message: error.message,
      });
      return;
    }
    next(error);
  }
};
