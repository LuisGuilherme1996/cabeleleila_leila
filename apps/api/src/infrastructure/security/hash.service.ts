import * as argon2 from 'argon2';
import type { IHashPort } from '../../application/ports/hash.port.js';

export class ArgonHashService implements IHashPort {
  async hash(plain: string): Promise<string> {
    return argon2.hash(plain);
  }

  async verify(plain: string, hashed: string): Promise<boolean> {
    return argon2.verify(hashed, plain);
  }
}
