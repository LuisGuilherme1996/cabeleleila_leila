export interface AccessTokenPayload {
  sub: string;
  email: string;
  perfis: string[];
}

export interface ITokenPort {
  signAccess(payload: AccessTokenPayload): string;
  verifyAccess(token: string): AccessTokenPayload;
  generateRefreshToken(): string;
  getRefreshTokenExpiry(): Date;
}
