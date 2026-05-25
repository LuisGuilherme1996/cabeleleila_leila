import { z } from 'zod';

export const criarServicoSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres.'),
  descricao: z.string().nullable().optional(),
  preco: z.number().nonnegative('Preço não pode ser negativo.'),
  duracaoMinutos: z.number().int().positive('Duração deve ser um inteiro maior que zero.'),
});

export const atualizarServicoSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres.').optional(),
  descricao: z.string().nullable().optional(),
  preco: z.number().nonnegative('Preço não pode ser negativo.').optional(),
  duracaoMinutos: z
    .number()
    .int()
    .positive('Duração deve ser um inteiro maior que zero.')
    .optional(),
});

export type CriarServicoInput = z.infer<typeof criarServicoSchema>;
export type AtualizarServicoInput = z.infer<typeof atualizarServicoSchema>;

export interface ServicoOutput {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  duracaoMinutos: number;
  ativo: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
}
