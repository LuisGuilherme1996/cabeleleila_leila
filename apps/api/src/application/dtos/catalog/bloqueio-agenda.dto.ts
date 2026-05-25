import { z } from 'zod';

export const criarBloqueioAgendaSchema = z
  .object({
    dataInicio: z.string().datetime({ message: 'Data de início inválida. Use formato ISO 8601.' }),
    dataFim: z.string().datetime({ message: 'Data de fim inválida. Use formato ISO 8601.' }),
    motivo: z.string().min(3, 'Motivo deve ter no mínimo 3 caracteres.'),
  })
  .refine((data) => new Date(data.dataInicio) > new Date(), {
    message: 'Data de início deve ser no futuro.',
    path: ['dataInicio'],
  })
  .refine((data) => new Date(data.dataFim) > new Date(data.dataInicio), {
    message: 'Data de fim deve ser posterior à data de início.',
    path: ['dataFim'],
  });

export type CriarBloqueioAgendaInput = z.infer<typeof criarBloqueioAgendaSchema>;

export interface BloqueioAgendaOutput {
  id: string;
  dataInicio: Date;
  dataFim: Date;
  motivo: string;
  criadoEm: Date;
}
