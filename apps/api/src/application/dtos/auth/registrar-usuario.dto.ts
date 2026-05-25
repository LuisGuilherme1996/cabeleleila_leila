import { z } from 'zod';

export const registrarUsuarioSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres.'),
  email: z.string().email('E-mail inválido.'),
  senha: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres.'),
  telefone: z.string().optional(),
});

export type RegistrarUsuarioInput = z.infer<typeof registrarUsuarioSchema>;

export interface RegistrarUsuarioOutput {
  id: string;
  nome: string;
  email: string;
}
