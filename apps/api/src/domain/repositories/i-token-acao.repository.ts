import type { TokenAcao, TipoTokenAcao } from '../entities/token-acao.entity.js';

export interface ITokenAcaoRepository {
  save(tokenAcao: TokenAcao): Promise<void>;
  findByToken(token: string): Promise<TokenAcao | null>;
  update(tokenAcao: TokenAcao): Promise<void>;
  revogarTokensAtivosPorUsuario(usuarioId: string, tipo: TipoTokenAcao): Promise<void>;
}
