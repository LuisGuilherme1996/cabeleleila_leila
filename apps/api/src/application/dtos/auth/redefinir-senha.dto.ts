import { z } from 'zod';

export const redefinirSenhaSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório.'),
  novaSenha: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres.'),
});

export type RedefinirSenhaInput = z.infer<typeof redefinirSenhaSchema>;
