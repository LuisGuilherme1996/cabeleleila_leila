import { pool } from '../database/pool.js';
import { Agendamento } from '../../domain/entities/agendamento.entity.js';
import type {
  AgendamentoSlot,
  DashboardData,
  IAgendamentoRepository,
  ListarAgendamentosFilter,
} from '../../domain/repositories/i-agendamento.repository.js';

interface AgendamentoRow {
  id: string;
  cliente_id: string;
  servico_id: string;
  data_hora: Date;
  status: 'PENDENTE' | 'CONFIRMADO' | 'CONCLUIDO' | 'CANCELADO';
  observacoes: string | null;
  criado_em: Date;
  atualizado_em: Date;
  nome_cliente: string;
  email_cliente?: string | null;
}

interface DashboardCountRow {
  status: string;
  total: string;
}

interface DashboardFaturamentoRow {
  faturamento: string | null;
}

interface DashboardProximoRow {
  id: string;
  data_hora: Date;
  status: 'PENDENTE' | 'CONFIRMADO' | 'CONCLUIDO' | 'CANCELADO';
  cliente_nome: string;
  servico_nome: string;
  servico_preco: string;
}

interface AvailabilityRow {
  data_hora: Date;
  duracao_minutos: string;
}

function toEntity(row: AgendamentoRow): Agendamento {
  return Agendamento.restore({
    id: row.id,
    clienteId: row.cliente_id,
    servicoId: row.servico_id,
    nomeCliente: row.nome_cliente,
    emailCliente: row.email_cliente ?? undefined,
    dataHora: row.data_hora,
    status: row.status,
    observacoes: row.observacoes,
    criadoEm: row.criado_em,
    atualizadoEm: row.atualizado_em,
  });
}

export class PgAgendamentoRepository implements IAgendamentoRepository {
  // ── Availability (catalog module) ────────────────────────────────────────

  async findAgendamentosNoPeriodo(dataInicio: Date, dataFim: Date): Promise<AgendamentoSlot[]> {
    const result = await pool.query<AvailabilityRow>(
      `SELECT a.data_hora, s.duracao_minutos
       FROM agendamentos a
       JOIN servicos s ON s.id = a.servico_id
       WHERE a.status != 'CANCELADO'
         AND a.data_hora < $2
         AND (a.data_hora + (s.duracao_minutos * INTERVAL '1 minute')) > $1`,
      [dataInicio, dataFim],
    );
    return result.rows.map((row) => ({
      dataHora: row.data_hora,
      duracaoMinutos: Number(row.duracao_minutos),
    }));
  }

  // ── CRUD ─────────────────────────────────────────────────────────────────

  async findById(id: string): Promise<Agendamento | null> {
    const result = await pool.query<AgendamentoRow>(
      'SELECT * FROM agendamentos WHERE id = $1',
      [id],
    );
    return result.rows[0] ? toEntity(result.rows[0]) : null;
  }

  async findMany(filter: ListarAgendamentosFilter): Promise<Agendamento[]> {
    const conditions: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    if (filter.clienteId) {
      conditions.push(`a.cliente_id = $${idx++}`);
      params.push(filter.clienteId);
    }
    if (filter.status) {
      conditions.push(`a.status = $${idx++}`);
      params.push(filter.status);
    }
    if (filter.dataInicio) {
      conditions.push(`a.data_hora >= $${idx++}`);
      params.push(filter.dataInicio);
    }
    if (filter.dataFim) {
      conditions.push(`a.data_hora <= $${idx++}`);
      params.push(filter.dataFim);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const pagina = filter.pagina ?? 1;
    const itensPorPagina = filter.itensPorPagina ?? 20;
    const offset = (pagina - 1) * itensPorPagina;

    params.push(itensPorPagina, offset);

    const result = await pool.query<AgendamentoRow>(
      `SELECT 
        a.*,
        u.nome AS nome_cliente,
        u.email AS email_cliente
      FROM 
        agendamentos as a
      LEFT JOIN usuarios u ON u.id = a.cliente_id
      ${where} 
      ORDER BY a.data_hora DESC LIMIT $${idx++} OFFSET $${idx}`,
      params,
    );
    return result.rows.map(toEntity);
  }

  async save(agendamento: Agendamento): Promise<void> {
    await pool.query(
      `INSERT INTO agendamentos (id, cliente_id, servico_id, data_hora, status, observacoes, criado_em, atualizado_em)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO UPDATE
         SET status        = EXCLUDED.status,
             observacoes   = EXCLUDED.observacoes,
             atualizado_em = EXCLUDED.atualizado_em`,
      [
        agendamento.id,
        agendamento.clienteId,
        agendamento.servicoId,
        agendamento.dataHora,
        agendamento.status,
        agendamento.observacoes,
        agendamento.criadoEm,
        agendamento.atualizadoEm,
      ],
    );
  }

  /**
   * Uses a transaction with SELECT ... FOR UPDATE to prevent double-booking.
   * Checks if any non-cancelled appointment overlaps with the new slot.
   */
  async saveWithConcurrencyCheck(
    agendamento: Agendamento,
    duracaoMinutos: number,
  ): Promise<{ success: boolean }> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const slotFim = new Date(agendamento.dataHora.getTime() + duracaoMinutos * 60_000);

      const conflict = await client.query(
        `SELECT a.id
         FROM agendamentos a
         JOIN servicos s ON s.id = a.servico_id
         WHERE a.status != 'CANCELADO'
           AND a.data_hora < $2
           AND (a.data_hora + (s.duracao_minutos * INTERVAL '1 minute')) > $1
         FOR UPDATE`,
        [agendamento.dataHora, slotFim],
      );

      if ((conflict.rowCount ?? 0) > 0) {
        await client.query('ROLLBACK');
        return { success: false };
      }

      await client.query(
        `INSERT INTO agendamentos (id, cliente_id, servico_id, data_hora, status, observacoes, criado_em, atualizado_em)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          agendamento.id,
          agendamento.clienteId,
          agendamento.servicoId,
          agendamento.dataHora,
          agendamento.status,
          agendamento.observacoes,
          agendamento.criadoEm,
          agendamento.atualizadoEm,
        ],
      );

      await client.query('COMMIT');
      return { success: true };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────

  async getDashboardData(data: Date): Promise<DashboardData> {
    const inicioDia = new Date(data);
    inicioDia.setHours(0, 0, 0, 0);
    const fimDia = new Date(data);
    fimDia.setHours(23, 59, 59, 999);

    const [contadoresResult, faturamentoResult, proximosResult] = await Promise.all([
      pool.query<DashboardCountRow>(
        `SELECT status, COUNT(*) AS total
         FROM agendamentos
         GROUP BY status`
      ),
      pool.query<DashboardFaturamentoRow>(
        `SELECT SUM(s.preco) AS faturamento
         FROM agendamentos a
         JOIN servicos s ON s.id = a.servico_id
         WHERE a.data_hora BETWEEN $1 AND $2
           AND a.status IN ('CONFIRMADO', 'CONCLUIDO')`,
        [inicioDia, fimDia],
      ),
      pool.query<DashboardProximoRow>(
        `SELECT a.id, a.data_hora, a.status,
                u.nome AS cliente_nome,
                s.nome AS servico_nome,
                s.preco AS servico_preco
         FROM agendamentos a
         JOIN usuarios u ON u.id = a.cliente_id
         JOIN servicos s ON s.id = a.servico_id
         WHERE a.data_hora >= NOW()
           AND a.status IN ('PENDENTE', 'CONFIRMADO')
         ORDER BY a.data_hora ASC
         LIMIT 5`,
      ),
    ]);

    const contadores = { pendente: 0, confirmado: 0, concluido: 0, cancelado: 0 };
    for (const row of contadoresResult.rows) {
      const key = row.status.toLowerCase() as keyof typeof contadores;
      if (key in contadores) {
        contadores[key] = Number(row.total);
      }
    }

    return {
      contadores,
      faturamentoEstimado: parseFloat(faturamentoResult.rows[0]?.faturamento ?? '0') || 0,
      proximosAgendamentos: proximosResult.rows.map((row) => ({
        id: row.id,
        dataHora: row.data_hora,
        status: row.status,
        clienteNome: row.cliente_nome,
        servicoNome: row.servico_nome,
        servicoPreco: parseFloat(row.servico_preco),
      })),
    };
  }
}
