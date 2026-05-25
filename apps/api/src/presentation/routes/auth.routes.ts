import { Router } from 'express';
import { z } from 'zod';
import { AuthController } from '../controllers/auth.controller.js';
import { RegistrarUsuarioUseCase } from '../../application/use-cases/auth/registrar-usuario.use-case.js';
import { LoginUseCase } from '../../application/use-cases/auth/login.use-case.js';
import { RefreshTokenUseCase } from '../../application/use-cases/auth/refresh-token.use-case.js';
import { LogoutUseCase } from '../../application/use-cases/auth/logout.use-case.js';
import { EsqueciSenhaUseCase } from '../../application/use-cases/auth/esqueci-senha.use-case.js';
import { VerifyResetCodeUseCase } from '../../application/use-cases/auth/verify-reset-code.use-case.js';
import { RedefinirSenhaUseCase } from '../../application/use-cases/auth/redefinir-senha.use-case.js';
import { ConfirmarEmailUseCase } from '../../application/use-cases/auth/confirmar-email.use-case.js';
import { GoogleOAuthCallbackUseCase } from '../../application/use-cases/auth/google-oauth-callback.use-case.js';
import { PgUsuarioRepository } from '../../infrastructure/repositories/pg-usuario.repository.js';
import { PgPerfilRepository } from '../../infrastructure/repositories/pg-perfil.repository.js';
import { PgRefreshTokenRepository } from '../../infrastructure/repositories/pg-refresh-token.repository.js';
import { PgTokenAcaoRepository } from '../../infrastructure/repositories/pg-token-acao.repository.js';
import { PgConexaoOAuthRepository } from '../../infrastructure/repositories/pg-conexao-oauth.repository.js';
import { ArgonHashService } from '../../infrastructure/security/hash.service.js';
import { JwtTokenService } from '../../infrastructure/security/jwt.service.js';
import { ResendEmailService } from '../../infrastructure/email/resend-email.service.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
import { authRateLimiter } from '../middlewares/rate-limit.middleware.js';
import { registrarUsuarioSchema } from '../../application/dtos/auth/registrar-usuario.dto.js';
import { loginSchema } from '../../application/dtos/auth/login.dto.js';
import { esqueciSenhaSchema } from '../../application/dtos/auth/esqueci-senha.dto.js';
import { verifyResetCodeSchema } from '../../application/dtos/auth/verify-reset-code.dto.js';
import { redefinirSenhaSchema } from '../../application/dtos/auth/redefinir-senha.dto.js';

// ── Composition Root ────────────────────────────────────────────────────────
const usuarioRepo = new PgUsuarioRepository();
const perfilRepo = new PgPerfilRepository();
const refreshTokenRepo = new PgRefreshTokenRepository();
const tokenAcaoRepo = new PgTokenAcaoRepository();
const conexaoOAuthRepo = new PgConexaoOAuthRepository();
const hashService = new ArgonHashService();
const tokenService = new JwtTokenService();
const emailService = new ResendEmailService();

const verifyResetCodeUseCase = new VerifyResetCodeUseCase(usuarioRepo, tokenAcaoRepo);

const controller = new AuthController(
  new RegistrarUsuarioUseCase(usuarioRepo, perfilRepo, tokenAcaoRepo, hashService, emailService),
  new LoginUseCase(usuarioRepo, perfilRepo, refreshTokenRepo, hashService, tokenService),
  new RefreshTokenUseCase(usuarioRepo, perfilRepo, refreshTokenRepo, tokenService),
  new LogoutUseCase(refreshTokenRepo),
  new EsqueciSenhaUseCase(usuarioRepo, tokenAcaoRepo, emailService),
  new RedefinirSenhaUseCase(usuarioRepo, tokenAcaoRepo, hashService),
  new ConfirmarEmailUseCase(usuarioRepo, tokenAcaoRepo),
  new GoogleOAuthCallbackUseCase(usuarioRepo, perfilRepo, refreshTokenRepo, conexaoOAuthRepo, tokenService),
  verifyResetCodeUseCase,
);

// ── Routes ───────────────────────────────────────────────────────────────────
const authRouter = Router();

authRouter.post(
  '/register',
  authRateLimiter,
  validateRequest(z.object({ body: registrarUsuarioSchema })),
  controller.registrar,
);

authRouter.post(
  '/login',
  authRateLimiter,
  validateRequest(z.object({ body: loginSchema })),
  controller.login,
);

authRouter.post('/refresh', authRateLimiter, controller.refresh);

authRouter.post('/logout', controller.logout);

authRouter.post(
  '/forgot-password',
  authRateLimiter,
  validateRequest(z.object({ body: esqueciSenhaSchema })),
  controller.esqueciSenha,
);

authRouter.post(
  '/verify-reset-code',
  authRateLimiter,
  validateRequest(z.object({ body: verifyResetCodeSchema })),
  controller.verifyResetCode,
);

authRouter.post(
  '/reset-password',
  authRateLimiter,
  validateRequest(z.object({ body: redefinirSenhaSchema })),
  controller.redefinirSenha,
);

authRouter.get('/confirm-email', controller.confirmarEmail);

authRouter.get('/google', controller.googleRedirect);

authRouter.get('/google/callback', controller.googleCallback);

export { authRouter };
