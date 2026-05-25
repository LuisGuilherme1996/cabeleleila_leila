import { z } from 'zod';

export const atualizarPerfilSchema = z
  .object({
    nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres.').optional(),
    telefone: z.string().min(8, 'Telefone inválido.').nullable().optional(),
  })
  .refine((data) => data.nome !== undefined || data.telefone !== undefined, {
    message: 'Pelo menos um campo deve ser fornecido para atualização.',
  });

export type AtualizarPerfilInput = z.infer<typeof atualizarPerfilSchema>;

export interface PerfilUsuarioOutput {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  emailConfirmado: boolean;
  perfis: string[];
}
