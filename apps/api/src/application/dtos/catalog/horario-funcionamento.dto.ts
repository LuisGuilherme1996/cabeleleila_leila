import { z } from 'zod';

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

export const salvarHorarioFuncionamentoSchema = z
  .object({
    diaSemana: z.number().int().min(0).max(6),
    horaInicio: z
      .string()
      .regex(/^\d{2}:\d{2}$/, 'Horário de início deve estar no formato HH:MM.'),
    horaFim: z.string().regex(/^\d{2}:\d{2}$/, 'Horário de fim deve estar no formato HH:MM.'),
    fechado: z.boolean().optional(),
  })
  .refine(
    (data) => data.fechado || toMinutes(data.horaFim) > toMinutes(data.horaInicio),
    { message: 'Hora de término deve ser posterior à hora de início.', path: ['horaFim'] },
  );

export type SalvarHorarioFuncionamentoInput = z.infer<typeof salvarHorarioFuncionamentoSchema>;

export interface HorarioFuncionamentoOutput {
  id: string;
  diaSemana: number;
  horaInicio: string;
  horaFim: string;
  fechado: boolean;
}
