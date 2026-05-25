import { Request, Response, NextFunction } from 'express';
import { DomainError, ValidationError } from '../../domain/errors/domain.error.js';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (error instanceof ValidationError) {
    res.status(400).json({
      status: 'fail',
      error: error.name,
      message: error.message,
      errors: error.errors || [],
    });
    return;
  }

  if (error instanceof DomainError) {
    res.status(error.statusCode).json({
      status: 'fail',
      error: error.name,
      message: error.message,
    });
    return;
  }

  // Unexpected errors (Internal Server Error)
  console.error('[CRITICAL ERROR]:', error);

  res.status(500).json({
    status: 'error',
    message:
      process.env.NODE_ENV === 'production'
        ? 'Ocorreu um erro interno no servidor.'
        : error.message,
  });
};
