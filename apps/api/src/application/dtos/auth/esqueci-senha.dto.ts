import { z } from 'zod';

export const esqueciSenhaSchema = z.object({
  email: z.string().email('E-mail inválido.'),
});

export type EsqueciSenhaInput = z.infer<typeof esqueciSenhaSchema>;
