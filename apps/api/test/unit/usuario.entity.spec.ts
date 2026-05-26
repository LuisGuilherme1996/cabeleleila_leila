/**
 * Unit tests — Usuario entity.
 */
import { describe, it, expect } from 'vitest';
import { Usuario } from '../../src/domain/entities/usuario.entity.js';
import { DomainError } from '../../src/domain/errors/domain.error.js';

describe('Usuario Entity', () => {
  // ── create ──────────────────────────────────────────────────────────────────
  describe('create()', () => {
    it('deve criar usuário com emailConfirmado = false', () => {
      const user = Usuario.create({
        nome: 'Maria Silva',
        email: 'maria@test.com',
        senhaHash: 'hash123',
      });

      expect(user.nome).toBe('Maria Silva');
      expect(user.email).toBe('maria@test.com');
      expect(user.emailConfirmado).toBe(false);
      expect(user.id).toBeDefined();
      expect(user.telefone).toBeNull();
    });

    it('deve normalizar email para lowercase', () => {
      const user = Usuario.create({
        nome: 'João',
        email: 'JOAO@Test.COM',
        senhaHash: 'hash',
      });

      expect(user.email).toBe('joao@test.com');
    });

    it('deve aceitar telefone opcional', () => {
      const user = Usuario.create({
        nome: 'Ana',
        email: 'ana@test.com',
        senhaHash: 'hash',
        telefone: '(11) 99999-0001',
      });

      expect(user.telefone).toBe('(11) 99999-0001');
    });

    it('deve lançar DomainError com e-mail inválido', () => {
      expect(() =>
        Usuario.create({ nome: 'Test', email: 'invalid', senhaHash: 'hash' }),
      ).toThrow(DomainError);
    });

    it('deve lançar DomainError com nome muito curto (<2 chars)', () => {
      expect(() =>
        Usuario.create({ nome: 'A', email: 'a@test.com', senhaHash: 'hash' }),
      ).toThrow(DomainError);
    });

    it('deve criar usuário sem senhaHash (OAuth flow)', () => {
      const user = Usuario.create({
        nome: 'OAuth User',
        email: 'oauth@test.com',
      });

      expect(user.senhaHash).toBeNull();
    });
  });

  // ── confirmarEmail ──────────────────────────────────────────────────────────
  describe('confirmarEmail()', () => {
    it('deve setar emailConfirmado para true', () => {
      const user = Usuario.create({
        nome: 'Test',
        email: 'test@test.com',
        senhaHash: 'hash',
      });

      expect(user.emailConfirmado).toBe(false);
      user.confirmarEmail();
      expect(user.emailConfirmado).toBe(true);
    });
  });

  // ── atualizarPerfil ─────────────────────────────────────────────────────────
  describe('atualizarPerfil()', () => {
    it('deve atualizar nome e telefone', () => {
      const user = Usuario.create({
        nome: 'Antigo',
        email: 'user@test.com',
        senhaHash: 'hash',
      });

      user.atualizarPerfil({ nome: 'Novo Nome', telefone: '(21) 88888-0000' });

      expect(user.nome).toBe('Novo Nome');
      expect(user.telefone).toBe('(21) 88888-0000');
    });

    it('deve atualizar apenas o nome', () => {
      const user = Usuario.create({
        nome: 'Antes',
        email: 'user@test.com',
        senhaHash: 'hash',
        telefone: '(11) 12345-6789',
      });

      user.atualizarPerfil({ nome: 'Depois' });

      expect(user.nome).toBe('Depois');
      expect(user.telefone).toBe('(11) 12345-6789');
    });

    it('deve lançar DomainError com nome muito curto', () => {
      const user = Usuario.create({
        nome: 'Valid',
        email: 'user@test.com',
        senhaHash: 'hash',
      });

      expect(() => user.atualizarPerfil({ nome: 'X' })).toThrow(DomainError);
    });
  });

  // ── atualizarSenha ──────────────────────────────────────────────────────────
  describe('atualizarSenha()', () => {
    it('deve atualizar senhaHash', () => {
      const user = Usuario.create({
        nome: 'Test',
        email: 'test@test.com',
        senhaHash: 'old_hash',
      });

      user.atualizarSenha('new_hash');
      expect(user.senhaHash).toBe('new_hash');
    });
  });
});
