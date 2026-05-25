import type { ConexaoOAuth } from '../entities/conexao-oauth.entity.js';

export interface IConexaoOAuthRepository {
  findByProvedorEProvedorId(provedor: string, provedorUsuarioId: string): Promise<ConexaoOAuth | null>;
  save(conexao: ConexaoOAuth): Promise<void>;
}
