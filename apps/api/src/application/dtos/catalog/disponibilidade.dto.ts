import { z } from 'zod';

export const listarDisponibilidadeSchema = z.object({
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD.'),
  servico_id: z.string().uuid('ID do serviço inválido.'),
});

export type ListarDisponibilidadeInput = z.infer<typeof listarDisponibilidadeSchema>;

export interface SlotDisponibilidade {
  horario: string;
  disponivel: boolean;
}

export interface DisponibilidadeOutput {
  data: string;
  servicoId: string;
  duracaoMinutos: number;
  slots: SlotDisponibilidade[];
}
