import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { env } from '../../config/env.js';
import type { ITokenPort, AccessTokenPayload } from '../../application/ports/token.port.js';
import { DomainError } from '../../domain/errors/domain.error.js';

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

export class JwtTokenService implements ITokenPort {
  signAccess(payload: AccessTokenPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
  }

  verifyAccess(token: string): AccessTokenPayload {
    try {
      return jwt.verify(token, env.JWT_SECRET) as AccessTokenPayload;
    } catch {
      throw new DomainError('Token de acesso inválido ou expirado.', 401);
    }
  }

  generateRefreshToken(): string {
    return crypto.randomBytes(40).toString('hex');
  }

  getRefreshTokenExpiry(): Date {
    return new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  }
}
