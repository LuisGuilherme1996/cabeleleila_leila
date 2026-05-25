/**
 * Auth helper — generate JWT access tokens for tests.
 */
import jwt from 'jsonwebtoken';
import type { AccessTokenPayload } from '../../src/application/ports/token.port.js';

const JWT_SECRET = process.env['JWT_SECRET'] ?? 'super_secret_jwt_key_123456_change_me_in_production';

export function makeAccessToken(payload: AccessTokenPayload, expiresIn = '15m'): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions);
}

export function makeAdminToken(userId: string, email = 'admin@test.com'): string {
  return makeAccessToken({ sub: userId, email, perfis: ['ADMIN'] });
}

export function makeClienteToken(userId: string, email = 'cliente@test.com'): string {
  return makeAccessToken({ sub: userId, email, perfis: ['CLIENTE'] });
}

export function makeExpiredToken(userId: string): string {
  return makeAccessToken({ sub: userId, email: 'user@test.com', perfis: ['CLIENTE'] }, '-1s');
}
