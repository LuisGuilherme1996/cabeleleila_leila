/**
 * Unit tests — HorarioFuncionamento entity.
 */
import { describe, it, expect } from 'vitest';
import { HorarioFuncionamento } from '../../src/domain/entities/horario-funcionamento.entity.js';
import { DomainError } from '../../src/domain/errors/domain.error.js';

describe('HorarioFuncionamento Entity', () => {
  // ── create ──────────────────────────────────────────────────────────────────
  describe('create()', () => {
    it('deve criar horário de funcionamento válido', () => {
      const h = HorarioFuncionamento.create({
        diaSemana: 1,
        horaInicio: '08:00',
        horaFim: '18:00',
      });

      expect(h.diaSemana).toBe(1);
      expect(h.horaInicio).toBe('08:00');
      expect(h.horaFim).toBe('18:00');
      expect(h.fechado).toBe(false);
      expect(h.id).toBeDefined();
    });

    it('deve criar horário fechado', () => {
      const h = HorarioFuncionamento.create({
        diaSemana: 0,
        horaInicio: '00:00',
        horaFim: '00:00',
        fechado: true,
      });

      expect(h.fechado).toBe(true);
    });

    it('deve lançar DomainError com dia da semana inválido', () => {
      expect(() =>
        HorarioFuncionamento.create({
          diaSemana: 7,
          horaInicio: '08:00',
          horaFim: '18:00',
        }),
      ).toThrow(DomainError);

      expect(() =>
        HorarioFuncionamento.create({
          diaSemana: -1,
          horaInicio: '08:00',
          horaFim: '18:00',
        }),
      ).toThrow(DomainError);
    });

    it('deve lançar DomainError quando horaFim <= horaInicio e não está fechado', () => {
      expect(() =>
        HorarioFuncionamento.create({
          diaSemana: 1,
          horaInicio: '18:00',
          horaFim: '08:00',
        }),
      ).toThrow(DomainError);

      expect(() =>
        HorarioFuncionamento.create({
          diaSemana: 1,
          horaInicio: '10:00',
          horaFim: '10:00',
        }),
      ).toThrow(DomainError);
    });

    it('deve lançar DomainError com formato de hora inválido', () => {
      expect(() =>
        HorarioFuncionamento.create({
          diaSemana: 1,
          horaInicio: '8:00',
          horaFim: '18:00',
        }),
      ).toThrow(DomainError);
    });
  });

  // ── atualizar ───────────────────────────────────────────────────────────────
  describe('atualizar()', () => {
    it('deve atualizar horários com sucesso', () => {
      const h = HorarioFuncionamento.create({
        diaSemana: 2,
        horaInicio: '08:00',
        horaFim: '18:00',
      });

      h.atualizar({ horaInicio: '09:00', horaFim: '17:00' });

      expect(h.horaInicio).toBe('09:00');
      expect(h.horaFim).toBe('17:00');
    });

    it('deve atualizar para fechado', () => {
      const h = HorarioFuncionamento.create({
        diaSemana: 3,
        horaInicio: '08:00',
        horaFim: '18:00',
      });

      h.atualizar({ fechado: true });

      expect(h.fechado).toBe(true);
    });

    it('deve lançar DomainError ao atualizar com horaFim <= horaInicio quando aberto', () => {
      const h = HorarioFuncionamento.create({
        diaSemana: 4,
        horaInicio: '08:00',
        horaFim: '18:00',
      });

      expect(() => h.atualizar({ horaInicio: '18:00', horaFim: '08:00' })).toThrow(DomainError);
    });
  });

  // ── restore ─────────────────────────────────────────────────────────────────
  describe('restore()', () => {
    it('deve restaurar entidade a partir de props', () => {
      const h = HorarioFuncionamento.restore({
        id: 'test-id',
        diaSemana: 5,
        horaInicio: '09:00',
        horaFim: '17:00',
        fechado: false,
      });

      expect(h.id).toBe('test-id');
      expect(h.diaSemana).toBe(5);
    });
  });
});
