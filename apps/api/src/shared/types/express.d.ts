import type { AccessTokenPayload } from '../../application/ports/token.port.js';

declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
    }
  }
}

export {};
