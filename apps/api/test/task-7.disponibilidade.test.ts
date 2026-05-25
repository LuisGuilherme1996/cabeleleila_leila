import { describe, it, expect, beforeAll, afterEach, vi, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import {
  cleanAll,
  seedPerfis,
  seedAdminUser,
  seedServicos,
  seedHorariosFuncionamento,
} from './helpers/db.helper.js';
import { pool } from '../src/infrastructure/database/pool.js';

const BASE = '/api/catalog/disponibilidade';

// Use a specific Monday (weekday 1) so horário is open (08:00-18:00)
// 2026-02-02 is a Monday
const OPEN_DAY = '2026-02-02';
const CLOSED_DAY = '2026-02-01'; // Sunday

let servicoId: string;
let servicoMasculinoId: string; // 30 min duration

beforeAll(async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-02-02T00:00:00Z'));
  await cleanAll();
  await seedPerfis();
  await seedAdminUser();
  await seedHorariosFuncionamento();
  const servicos = await seedServicos();
  // Corte Feminino = 60min, Corte Masculino = 30min
  for (const s of servicos) {
    if (s.nome === 'Corte Feminino') servicoId = s.id;
    if (s.nome === 'Corte Masculino') servicoMasculinoId = s.id;
  }
});

afterAll(async () => {
  vi.useRealTimers();
});

afterEach(async () => {
  await pool.query(`TRUNCATE TABLE agendamentos RESTART IDENTITY CASCADE`);
  await pool.query(`TRUNCATE TABLE bloqueios_agenda RESTART IDENTITY CASCADE`);
});

// ─────────────────────────────────────────────────────────────────────────────
// 7.1 Query com data válida
// ─────────────────────────────────────────────────────────────────────────────
describe('Task 7.1 — Disponibilidade: Data válida', () => {
  it('7.1.1 ✅ Query com data válida (YYYY-MM-DD) → 200 slots', async () => {
    const res = await request(app)
      .get(BASE)
      .query({ data: OPEN_DAY, servico_id: servicoId });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.slots)).toBe(true);
    expect(res.body.data.slots.length).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 7.2 Dia fechado
// ─────────────────────────────────────────────────────────────────────────────
describe('Task 7.2 — Disponibilidade: Dia fechado', () => {
  it('7.2.1 ✅ Dia fechado → 200 slots vazio', async () => {
    const res = await request(app)
      .get(BASE)
      .query({ data: CLOSED_DAY, servico_id: servicoId });
    expect(res.status).toBe(200);
    expect(res.body.data.slots).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 7.3 Bloqueio parcial
// ─────────────────────────────────────────────────────────────────────────────
describe('Task 7.3 — Disponibilidade: Bloqueio parcial', () => {
  it('7.3.1 ✅ Dia com bloqueio parcial → slots minus bloqueio', async () => {
    // Block 08:00-12:00 on OPEN_DAY
    await pool.query(
      `INSERT INTO bloqueios_agenda (data_inicio, data_fim, motivo)
       VALUES ($1, $2, 'Bloqueio parcial')`,
      [new Date(2026, 1, 2, 8, 0), new Date(2026, 1, 2, 12, 0)],
    );
    const resWithoutBlock = await request(app)
      .get(BASE)
      .query({ data: OPEN_DAY, servico_id: servicoId });

    // Some slots should be available (after 12:00) and some blocked
    expect(resWithoutBlock.status).toBe(200);
    const slots = resWithoutBlock.body.data.slots as Array<{ horario: string; disponivel: boolean }>;
    const disponivel = slots.filter((s) => s.disponivel);
    const bloqueados = slots.filter((s) => !s.disponivel);
    expect(disponivel.length).toBeGreaterThan(0);
    expect(bloqueados.length).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 7.4 Todos slots ocupados
// ─────────────────────────────────────────────────────────────────────────────
describe('Task 7.4 — Disponibilidade: Todos slots ocupados', () => {
  it('7.4.1 ✅ Dia com todos slots ocupados → slots todos indisponíveis', async () => {
    // Block the entire operational day (08:00-18:00) with a single bloqueio
    const dataInicio = new Date(2026, 1, 2, 8, 0, 0); // local time 08:00
    const dataFim = new Date(2026, 1, 2, 18, 0, 0);   // local time 18:00
    await pool.query(
      `INSERT INTO bloqueios_agenda (data_inicio, data_fim, motivo) VALUES ($1, $2, 'Dia inteiro bloqueado')`,
      [dataInicio, dataFim],
    );

    const res = await request(app)
      .get(BASE)
      .query({ data: OPEN_DAY, servico_id: servicoMasculinoId });

    expect(res.status).toBe(200);
    const allSlots = res.body.data.slots as Array<{ horario: string; disponivel: boolean }>;
    expect(allSlots.length).toBeGreaterThan(0);
    const disponiveisSlots = allSlots.filter((s) => s.disponivel);
    if (disponiveisSlots.length > 0) {
      console.log('Still disponivel slots after full-day bloqueio:', disponiveisSlots.map((s) => s.horario));
    }
    expect(allSlots.every((s) => !s.disponivel)).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 7.5 data ausente
// ─────────────────────────────────────────────────────────────────────────────
describe('Task 7.5 — Disponibilidade: data ausente', () => {
  it('7.5.1 ❌ data ausente → 422', async () => {
    const res = await request(app)
      .get(BASE)
      .query({ servico_id: servicoId });
    expect(res.status).toBe(422);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 7.6 data em formato inválido
// ─────────────────────────────────────────────────────────────────────────────
describe('Task 7.6 — Disponibilidade: data inválida', () => {
  it('7.6.1 ❌ data em formato inválido → 422', async () => {
    const res = await request(app)
      .get(BASE)
      .query({ data: '02-02-2026', servico_id: servicoId });
    expect(res.status).toBe(422);
  });
});
