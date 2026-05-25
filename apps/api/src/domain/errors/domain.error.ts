export class DomainError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 400,
  ) {
    super(message);
    this.name = 'DomainError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends DomainError {
  constructor(
    message: string,
    public readonly errors?: unknown[],
  ) {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

export class EmailJaExisteError extends DomainError {
  constructor() {
    super('Este e-mail já está em uso.', 409);
    this.name = 'EmailJaExisteError';
  }
}

export class CredenciaisInvalidasError extends DomainError {
  constructor() {
    super('E-mail ou senha inválidos.', 401);
    this.name = 'CredenciaisInvalidasError';
  }
}

export class EmailNaoConfirmadoError extends DomainError {
  constructor() {
    super('E-mail não confirmado. Por favor, verifique sua caixa de entrada.', 403);
    this.name = 'EmailNaoConfirmadoError';
  }
}

export class RefreshTokenInvalidoError extends DomainError {
  constructor() {
    super('Token de atualização inválido ou expirado.', 401);
    this.name = 'RefreshTokenInvalidoError';
  }
}

export class UsuarioNaoEncontradoError extends DomainError {
  constructor() {
    super('Usuário não encontrado.', 404);
    this.name = 'UsuarioNaoEncontradoError';
  }
}

export class TokenAcaoInvalidoError extends DomainError {
  constructor() {
    super('Token inválido, expirado ou já utilizado.', 400);
    this.name = 'TokenAcaoInvalidoError';
  }
}

export class OAuthProvedorError extends DomainError {
  constructor(message = 'Erro ao autenticar com provedor externo.') {
    super(message, 502);
    this.name = 'OAuthProvedorError';
  }
}

export class ServicoNaoEncontradoError extends DomainError {
  constructor() {
    super('Serviço não encontrado.', 404);
    this.name = 'ServicoNaoEncontradoError';
  }
}

export class HorarioFuncionamentoNaoEncontradoError extends DomainError {
  constructor() {
    super('Horário de funcionamento não encontrado.', 404);
    this.name = 'HorarioFuncionamentoNaoEncontradoError';
  }
}

export class BloqueioAgendaNaoEncontradoError extends DomainError {
  constructor() {
    super('Bloqueio de agenda não encontrado.', 404);
    this.name = 'BloqueioAgendaNaoEncontradoError';
  }
}

export class AgendamentoNaoEncontradoError extends DomainError {
  constructor() {
    super('Agendamento não encontrado.', 404);
    this.name = 'AgendamentoNaoEncontradoError';
  }
}

export class AgendamentoConflitanteError extends DomainError {
  constructor() {
    super('O horário selecionado já está ocupado. Por favor, escolha outro horário.', 409);
    this.name = 'AgendamentoConflitanteError';
  }
}

export class AgendamentoAcessoNegadoError extends DomainError {
  constructor() {
    super('Você não tem permissão para modificar este agendamento.', 403);
    this.name = 'AgendamentoAcessoNegadoError';
  }
}
