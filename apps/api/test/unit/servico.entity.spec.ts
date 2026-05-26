/**
 * Unit tests — Servico entity.
 */
import { describe, it, expect } from 'vitest';
import { Servico } from '../../src/domain/entities/servico.entity.js';
import { DomainError } from '../../src/domain/errors/domain.error.js';

describe('Servico Entity', () => {
  // ── create ──────────────────────────────────────────────────────────────────
  describe('create()', () => {
    it('deve criar serviço com ativo = true', () => {
      const servico = Servico.create({
        nome: 'Corte Feminino',
        descricao: 'Corte e finalização',
        preco: 80,
        duracaoMinutos: 60,
      });

      expect(servico.nome).toBe('Corte Feminino');
      expect(servico.preco).toBe(80);
      expect(servico.duracaoMinutos).toBe(60);
      expect(servico.ativo).toBe(true);
      expect(servico.id).toBeDefined();
    });

    it('deve aceitar descrição nula', () => {
      const servico = Servico.create({
        nome: 'Escova',
        preco: 50,
        duracaoMinutos: 30,
      });

      expect(servico.descricao).toBeNull();
    });

    it('deve lançar DomainError com preço negativo', () => {
      expect(() =>
        Servico.create({ nome: 'Test', preco: -10, duracaoMinutos: 30 }),
      ).toThrow(DomainError);
    });

    it('deve lançar DomainError com duração não inteira', () => {
      expect(() =>
        Servico.create({ nome: 'Test', preco: 50, duracaoMinutos: 30.5 }),
      ).toThrow(DomainError);
    });

    it('deve lançar DomainError com duração zero ou negativa', () => {
      expect(() =>
        Servico.create({ nome: 'Test', preco: 50, duracaoMinutos: 0 }),
      ).toThrow(DomainError);

      expect(() =>
        Servico.create({ nome: 'Test', preco: 50, duracaoMinutos: -30 }),
      ).toThrow(DomainError);
    });

    it('deve lançar DomainError com nome muito curto', () => {
      expect(() =>
        Servico.create({ nome: 'A', preco: 50, duracaoMinutos: 30 }),
      ).toThrow(DomainError);
    });
  });

  // ── inativar / ativar ───────────────────────────────────────────────────────
  describe('inativar() / ativar()', () => {
    it('deve inativar serviço', () => {
      const servico = Servico.create({
        nome: 'Corte',
        preco: 50,
        duracaoMinutos: 30,
      });

      servico.inativar();
      expect(servico.ativo).toBe(false);
    });

    it('deve reativar serviço', () => {
      const servico = Servico.create({
        nome: 'Corte',
        preco: 50,
        duracaoMinutos: 30,
      });

      servico.inativar();
      expect(servico.ativo).toBe(false);

      servico.ativar();
      expect(servico.ativo).toBe(true);
    });
  });

  // ── atualizar ───────────────────────────────────────────────────────────────
  describe('atualizar()', () => {
    it('deve atualizar apenas os campos fornecidos', () => {
      const servico = Servico.create({
        nome: 'Original',
        descricao: 'Desc original',
        preco: 100,
        duracaoMinutos: 60,
      });

      servico.atualizar({ preco: 120 });

      expect(servico.nome).toBe('Original');
      expect(servico.preco).toBe(120);
      expect(servico.duracaoMinutos).toBe(60);
    });

    it('deve atualizar todos os campos', () => {
      const servico = Servico.create({
        nome: 'Original',
        preco: 100,
        duracaoMinutos: 60,
      });

      servico.atualizar({
        nome: 'Novo Nome',
        descricao: 'Nova descrição',
        preco: 150,
        duracaoMinutos: 90,
      });

      expect(servico.nome).toBe('Novo Nome');
      expect(servico.descricao).toBe('Nova descrição');
      expect(servico.preco).toBe(150);
      expect(servico.duracaoMinutos).toBe(90);
    });

    it('deve lançar DomainError ao atualizar com preço negativo', () => {
      const servico = Servico.create({
        nome: 'Test',
        preco: 100,
        duracaoMinutos: 60,
      });

      expect(() => servico.atualizar({ preco: -5 })).toThrow(DomainError);
    });

    it('deve lançar DomainError ao atualizar com nome muito curto', () => {
      const servico = Servico.create({
        nome: 'Test',
        preco: 100,
        duracaoMinutos: 60,
      });

      expect(() => servico.atualizar({ nome: 'X' })).toThrow(DomainError);
    });
  });
});
