import { OAuth2Client } from 'google-auth-library';
import { Usuario } from '../../../domain/entities/usuario.entity.js';
import { ConexaoOAuth } from '../../../domain/entities/conexao-oauth.entity.js';
import { RefreshToken } from '../../../domain/entities/refresh-token.entity.js';
import type { IUsuarioRepository } from '../../../domain/repositories/i-usuario.repository.js';
import type { IPerfilRepository } from '../../../domain/repositories/i-perfil.repository.js';
import type { IRefreshTokenRepository } from '../../../domain/repositories/i-refresh-token.repository.js';
import type { IConexaoOAuthRepository } from '../../../domain/repositories/i-conexao-oauth.repository.js';
import type { ITokenPort } from '../../ports/token.port.js';
import { OAuthProvedorError } from '../../../domain/errors/domain.error.js';
import { env } from '../../../config/env.js';

export interface GoogleOAuthCallbackOutput {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiry: Date;
  usuario: {
    id: string;
    nome: string;
    email: string;
    perfis: string[];
  };
}

export class GoogleOAuthCallbackUseCase {
  constructor(
    private readonly usuarioRepository: IUsuarioRepository,
    private readonly perfilRepository: IPerfilRepository,
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly conexaoOAuthRepository: IConexaoOAuthRepository,
    private readonly tokenPort: ITokenPort,
  ) {}

  async execute(code: string): Promise<GoogleOAuthCallbackOutput> {
    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.GOOGLE_REDIRECT_URI) {
      throw new OAuthProvedorError('OAuth2 com Google não está configurado neste servidor.');
    }

    const oauth2Client = new OAuth2Client(
      env.GOOGLE_CLIENT_ID,
      env.GOOGLE_CLIENT_SECRET,
      env.GOOGLE_REDIRECT_URI,
    );

    let googleUserId: string;
    let googleEmail: string;
    let googleNome: string;

    try {
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);

      const tokenInfo = await oauth2Client.verifyIdToken({
        idToken: tokens.id_token!,
        audience: env.GOOGLE_CLIENT_ID,
      });

      const payload = tokenInfo.getPayload();
      if (!payload || !payload.sub || !payload.email) {
        throw new OAuthProvedorError('Não foi possível obter informações do perfil Google.');
      }

      googleUserId = payload.sub;
      googleEmail = payload.email;
      googleNome = payload.name ?? payload.email;
    } catch (error) {
      if (error instanceof OAuthProvedorError) throw error;
      throw new OAuthProvedorError('Falha ao trocar o código de autorização com o Google.');
    }

    const conexaoExistente = await this.conexaoOAuthRepository.findByProvedorEProvedorId(
      'google',
      googleUserId,
    );

    let usuario: Usuario | null = null;

    if (conexaoExistente) {
      usuario = await this.usuarioRepository.findById(conexaoExistente.usuarioId);
    }

    if (!usuario) {
      // Try to find by email first (link existing account)
      usuario = await this.usuarioRepository.findByEmail(googleEmail);

      if (!usuario) {
        // Create new user
        usuario = Usuario.create({ nome: googleNome, email: googleEmail });
        usuario.confirmarEmail();
        await this.usuarioRepository.save(usuario);

        const perfilCliente = await this.perfilRepository.findByNome('CLIENTE');
        if (perfilCliente) {
          await this.perfilRepository.associarPerfilAoUsuario(usuario.id, perfilCliente.id);
        }
      }

      // Save OAuth connection
      const conexao = ConexaoOAuth.create({
        usuarioId: usuario.id,
        provedor: 'google',
        provedorUsuarioId: googleUserId,
      });
      await this.conexaoOAuthRepository.save(conexao);
    }

    const perfis = await this.perfilRepository.findPerfisByUsuarioId(usuario.id);
    const nomePerfis = perfis.map((p) => p.nome);

    const accessToken = this.tokenPort.signAccess({
      sub: usuario.id,
      email: usuario.email,
      perfis: nomePerfis,
    });

    const rawRefreshToken = this.tokenPort.generateRefreshToken();
    const expiraEm = this.tokenPort.getRefreshTokenExpiry();

    const sessao = RefreshToken.create({
      usuarioId: usuario.id,
      token: rawRefreshToken,
      expiraEm,
    });
    await this.refreshTokenRepository.save(sessao);

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      refreshTokenExpiry: expiraEm,
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, perfis: nomePerfis },
    };
  }
}
