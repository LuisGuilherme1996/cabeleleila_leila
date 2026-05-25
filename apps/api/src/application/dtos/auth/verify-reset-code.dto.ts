import { z } from 'zod';

export const verifyResetCodeSchema = z.object({
  email: z.string().email('E-mail inválido.'),
  code: z.string().length(6, 'O código deve ter 6 dígitos.'),
});

export type VerifyResetCodeInput = z.infer<typeof verifyResetCodeSchema>;
