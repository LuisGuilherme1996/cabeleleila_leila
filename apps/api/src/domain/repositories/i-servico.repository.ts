import type { Servico } from '../entities/servico.entity.js';

export interface IServicoRepository {
  findById(id: string): Promise<Servico | null>;
  findAll(apenasAtivos?: boolean): Promise<Servico[]>;
  save(servico: Servico): Promise<void>;
  delete(id: string): Promise<void>;
}
