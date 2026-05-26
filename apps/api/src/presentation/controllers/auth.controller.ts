import { Request, Response, NextFunction } from 'express';
import type { RegistrarUsuarioUseCase } from '../../application/use-cases/auth/registrar-usuario.use-case.js';
import type { LoginUseCase } from '../../application/use-cases/auth/login.use-case.js';
import type { RefreshTokenUseCase } from '../../application/use-cases/auth/refresh-token.use-case.js';
import type { LogoutUseCase } from '../../application/use-cases/auth/logout.use-case.js';
import type { EsqueciSenhaUseCase } from '../../application/use-cases/auth/esqueci-senha.use-case.js';
import type { RedefinirSenhaUseCase } from '../../application/use-cases/auth/redefinir-senha.use-case.js';
import type { ConfirmarEmailUseCase } from '../../application/use-cases/auth/confirmar-email.use-case.js';
import type { GoogleOAuthCallbackUseCase } from '../../application/use-cases/auth/google-oauth-callback.use-case.js';
import type { VerifyResetCodeUseCase } from '../../application/use-cases/auth/verify-reset-code.use-case.js';
import { RefreshTokenInvalidoError, DomainError, OAuthProvedorError } from '../../domain/errors/domain.error.js';
import { env } from '../../config/env.js';
import { OAuth2Client } from 'google-auth-library';

const IS_PROD = process.env.NODE_ENV === 'production';

/**
 * In production we use the __Host- prefix (requires Secure + Path=/).
 * In development (HTTP) the prefix is rejected by browsers, so we
 * fall back to a plain name.
 */
const REFRESH_COOKIE = IS_PROD ? '__Host-refresh-token' : 'refresh-token';

const cookieOptions = (expires: Date) =>
  ({
    httpOnly: true,
    secure: IS_PROD,
    sameSite: IS_PROD ? ('strict' as const) : ('lax' as const),
    expires,
    path: '/',
  }) as const;

export class AuthController {
  constructor(
    private readonly registrarUseCase: RegistrarUsuarioUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly esqueciSenhaUseCase: EsqueciSenhaUseCase,
    private readonly redefinirSenhaUseCase: RedefinirSenhaUseCase,
    private readonly confirmarEmailUseCase: ConfirmarEmailUseCase,
    private readonly googleOAuthCallbackUseCase: GoogleOAuthCallbackUseCase,
    private readonly verifyResetCodeUseCase: VerifyResetCodeUseCase,
  ) {}

  registrar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const output = await this.registrarUseCase.execute(req.body);
      res.status(201).json({ status: 'success', data: output });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { accessToken, refreshToken, refreshTokenExpiry, usuario } =
        await this.loginUseCase.execute(req.body);

      res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions(refreshTokenExpiry));
      res.status(200).json({ status: 'success', data: { accessToken, usuario } });
    } catch (error) {
      next(error);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tokenValue: string | undefined = req.cookies?.[REFRESH_COOKIE];
      if (!tokenValue) {
        throw new RefreshTokenInvalidoError();
      }

      const { accessToken, refreshToken, refreshTokenExpiry } =
        await this.refreshTokenUseCase.execute(tokenValue);

      res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions(refreshTokenExpiry));
      res.status(200).json({ status: 'success', data: { accessToken } });
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tokenValue: string | undefined = req.cookies?.[REFRESH_COOKIE];
      if (tokenValue) {
        await this.logoutUseCase.execute(tokenValue);
      }

      res.clearCookie(REFRESH_COOKIE, { path: '/' });
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  };

  esqueciSenha = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const output = await this.esqueciSenhaUseCase.execute(req.body);
      res.status(200).json({
        status: 'success',
        message: 'Se o e-mail existir em nossa base, você receberá as instruções de recuperação.',
        ...(process.env.NODE_ENV !== 'production' && output.token ? { debug_token: output.token } : {}),
      });
    } catch (error) {
      next(error);
    }
  };

  verifyResetCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const output = await this.verifyResetCodeUseCase.execute(req.body);
      res.status(200).json({
        status: 'success',
        data: output,
      });
    } catch (error) {
      next(error);
    }
  };

  redefinirSenha = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.redefinirSenhaUseCase.execute(req.body);
      res.status(200).json({ status: 'success', message: 'Senha redefinida com sucesso.' });
    } catch (error) {
      next(error);
    }
  };

  confirmarEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = req.query['token'] as string | undefined;
      if (!token) {
        throw new DomainError('Token de confirmação não fornecido.', 400);
      }
      await this.confirmarEmailUseCase.execute(token);

      const isAjaxOrTest = req.xhr || (req.headers.accept && req.headers.accept.includes('application/json')) || process.env.NODE_ENV === 'test';
      if (isAjaxOrTest) {
        res.status(200).json({ status: 'success', message: 'E-mail verificado com sucesso.' });
      } else {
        res.redirect('http://localhost:4200/login?email_confirmed=true');
      }
    } catch (error) {
      const isAjaxOrTest = req.xhr || (req.headers.accept && req.headers.accept.includes('application/json')) || process.env.NODE_ENV === 'test';
      if (isAjaxOrTest) {
        next(error);
      } else {
        res.redirect('http://localhost:4200/login?email_confirmed=false');
      }
    }
  };

  googleRedirect = (_req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_REDIRECT_URI) {
        throw new OAuthProvedorError('OAuth2 com Google não está configurado neste servidor.');
      }

      const oauth2Client = new OAuth2Client(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, env.GOOGLE_REDIRECT_URI);
      const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['openid', 'email', 'profile'],
        prompt: 'consent',
      });

      res.redirect(url);
    } catch (error) {
      next(error);
    }
  };

  googleCallback = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const oauthError = req.query['error'] as string | undefined;
      if (oauthError) {
        if (req.xhr || (req.headers.accept && req.headers.accept.includes('application/json')) || process.env.NODE_ENV === 'test') {
          throw new DomainError('Autenticação cancelada pelo usuário.', 400);
        }
        return res.redirect('http://localhost:4200/login?error=oauth_denied');
      }

      const code = req.query['code'] as string | undefined;
      if (!code) {
        if (req.xhr || (req.headers.accept && req.headers.accept.includes('application/json')) || process.env.NODE_ENV === 'test') {
          throw new OAuthProvedorError('Código de autorização não fornecido.');
        }
        return res.redirect('http://localhost:4200/login?error=oauth_no_code');
      }

      // Check if AJAX or Test environment
      const isAjaxOrTest = req.xhr || (req.headers.accept && req.headers.accept.includes('application/json')) || process.env.NODE_ENV === 'test';

      if (!isAjaxOrTest) {
        // Redireciona para o frontend tratar o callback do OAuth
        return res.redirect(`http://localhost:4200/auth/google/callback?code=${encodeURIComponent(code)}`);
      }

      const { accessToken, refreshToken, refreshTokenExpiry, usuario } =
        await this.googleOAuthCallbackUseCase.execute(code);

      res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions(refreshTokenExpiry));
      res.status(200).json({ status: 'success', data: { accessToken, usuario } });
    } catch (error) {
      const isAjaxOrTest = req.xhr || (req.headers.accept && req.headers.accept.includes('application/json')) || process.env.NODE_ENV === 'test';
      if (isAjaxOrTest) {
        next(error);
      } else {
        res.redirect('http://localhost:4200/login?error=oauth_failed');
      }
    }
  };
}
