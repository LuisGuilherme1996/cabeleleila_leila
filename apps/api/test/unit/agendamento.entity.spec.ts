/**
 * Unit tests — Agendamento entity (state machine + business rules).
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { Agendamento } from '../../src/domain/entities/agendamento.entity.js';
import { DomainError } from '../../src/domain/errors/domain.error.js';

function futureDate(hoursFromNow: number): Date {
  return new Date(Date.now() + hoursFromNow * 60 * 60 * 1000);
}

describe('Agendamento Entity', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── create ──────────────────────────────────────────────────────────────────
  describe('create()', () => {
    it('deve criar agendamento com status PENDENTE quando a data é válida (>1h futuro)', () => {
      const ag = Agendamento.create({
        clienteId: crypto.randomUUID(),
        servicoId: crypto.randomUUID(),
        dataHora: futureDate(2),
      });

      expect(ag.status).toBe('PENDENTE');
      expect(ag.id).toBeDefined();
      expect(ag.observacoes).toBeNull();
    });

    it('deve lançar DomainError ao criar com data < 1h no futuro', () => {
      expect(() =>
        Agendamento.create({
          clienteId: crypto.randomUUID(),
          servicoId: crypto.randomUUID(),
          dataHora: futureDate(0.5), // 30 minutos
        }),
      ).toThrow(DomainError);
    });

    it('deve aceitar observações opcionais', () => {
      const ag = Agendamento.create({
        clienteId: crypto.randomUUID(),
        servicoId: crypto.randomUUID(),
        dataHora: futureDate(3),
        observacoes: 'Tenho alergia a tinta',
      });

      expect(ag.observacoes).toBe('Tenho alergia a tinta');
    });
  });

  // ── confirmar ───────────────────────────────────────────────────────────────
  describe('confirmar()', () => {
    it('deve transicionar de PENDENTE para CONFIRMADO', () => {
      const ag = Agendamento.create({
        clienteId: crypto.randomUUID(),
        servicoId: crypto.randomUUID(),
        dataHora: futureDate(3),
      });

      ag.confirmar();
      expect(ag.status).toBe('CONFIRMADO');
    });

    it('deve lançar DomainError ao confirmar um CONFIRMADO', () => {
      const ag = Agendamento.create({
        clienteId: crypto.randomUUID(),
        servicoId: crypto.randomUUID(),
        dataHora: futureDate(3),
      });
      ag.confirmar();

      expect(() => ag.confirmar()).toThrow(DomainError);
    });

    it('deve lançar DomainError ao confirmar um CANCELADO', () => {
      const ag = Agendamento.create({
        clienteId: crypto.randomUUID(),
        servicoId: crypto.randomUUID(),
        dataHora: futureDate(5),
      });
      ag.cancelar(true);

      expect(() => ag.confirmar()).toThrow(DomainError);
    });
  });

  // ── concluir ────────────────────────────────────────────────────────────────
  describe('concluir()', () => {
    it('deve transicionar de CONFIRMADO para CONCLUIDO', () => {
      const ag = Agendamento.create({
        clienteId: crypto.randomUUID(),
        servicoId: crypto.randomUUID(),
        dataHora: futureDate(3),
      });
      ag.confirmar();
      ag.concluir();

      expect(ag.status).toBe('CONCLUIDO');
    });

    it('deve lançar DomainError ao concluir um PENDENTE', () => {
      const ag = Agendamento.create({
        clienteId: crypto.randomUUID(),
        servicoId: crypto.randomUUID(),
        dataHora: futureDate(3),
      });

      expect(() => ag.concluir()).toThrow(DomainError);
    });

    it('deve lançar DomainError ao concluir um CANCELADO', () => {
      const ag = Agendamento.create({
        clienteId: crypto.randomUUID(),
        servicoId: crypto.randomUUID(),
        dataHora: futureDate(5),
      });
      ag.cancelar(true);

      expect(() => ag.concluir()).toThrow(DomainError);
    });
  });

  // ── cancelar ────────────────────────────────────────────────────────────────
  describe('cancelar()', () => {
    it('deve cancelar agendamento PENDENTE quando cliente tem > 2h de antecedência', () => {
      const ag = Agendamento.create({
        clienteId: crypto.randomUUID(),
        servicoId: crypto.randomUUID(),
        dataHora: futureDate(5), // 5 horas no futuro
      });

      ag.cancelar(false);
      expect(ag.status).toBe('CANCELADO');
    });

    it('deve lançar DomainError quando cliente tenta cancelar com < 2h de antecedência', () => {
      // Create agendamento with a far future date
      const dataHora = futureDate(3);
      const ag = Agendamento.create({
        clienteId: crypto.randomUUID(),
        servicoId: crypto.randomUUID(),
        dataHora,
      });

      // Use fake timers to simulate being within 2h of the appointment
      vi.useFakeTimers();
      vi.setSystemTime(new Date(dataHora.getTime() - 60 * 60 * 1000)); // 1h before

      expect(() => ag.cancelar(false)).toThrow(DomainError);

      vi.useRealTimers();
    });

    it('deve permitir admin cancelar mesmo com < 2h (ignora regra de antecedência)', () => {
      const dataHora = futureDate(3);
      const ag = Agendamento.create({
        clienteId: crypto.randomUUID(),
        servicoId: crypto.randomUUID(),
        dataHora,
      });

      // Use fake timers to simulate being within 2h of the appointment
      vi.useFakeTimers();
      vi.setSystemTime(new Date(dataHora.getTime() - 30 * 60 * 1000)); // 30 min before

      ag.cancelar(true);
      expect(ag.status).toBe('CANCELADO');

      vi.useRealTimers();
    });

    it('deve permitir admin cancelar CONFIRMADO', () => {
      const ag = Agendamento.create({
        clienteId: crypto.randomUUID(),
        servicoId: crypto.randomUUID(),
        dataHora: futureDate(5),
      });
      ag.confirmar();

      ag.cancelar(true);
      expect(ag.status).toBe('CANCELADO');
    });

    it('deve lançar DomainError ao cancelar um CONCLUIDO', () => {
      const ag = Agendamento.create({
        clienteId: crypto.randomUUID(),
        servicoId: crypto.randomUUID(),
        dataHora: futureDate(3),
      });
      ag.confirmar();
      ag.concluir();

      expect(() => ag.cancelar(true)).toThrow(DomainError);
    });

    it('deve lançar DomainError ao cancelar um já CANCELADO', () => {
      const ag = Agendamento.create({
        clienteId: crypto.randomUUID(),
        servicoId: crypto.randomUUID(),
        dataHora: futureDate(5),
      });
      ag.cancelar(true);

      expect(() => ag.cancelar(true)).toThrow(DomainError);
    });
  });

  // ── toJSON ──────────────────────────────────────────────────────────────────
  describe('toJSON()', () => {
    it('deve retornar todas as propriedades', () => {
      const ag = Agendamento.create({
        clienteId: 'c1',
        servicoId: 's1',
        dataHora: futureDate(3),
      });

      const json = ag.toJSON();
      expect(json).toHaveProperty('id');
      expect(json).toHaveProperty('clienteId', 'c1');
      expect(json).toHaveProperty('servicoId', 's1');
      expect(json).toHaveProperty('status', 'PENDENTE');
    });
  });
});
