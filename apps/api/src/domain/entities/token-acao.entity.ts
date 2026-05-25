export type TipoTokenAcao = 'CONFIRMACAO_EMAIL' | 'RECUPERACAO_SENHA';

interface TokenAcaoProps {
  id: string;
  usuarioId: string;
  token: string;
  tipo: TipoTokenAcao;
  usado: boolean;
  expiraEm: Date;
  criadoEm: Date;
}

export class TokenAcao {
  private props: TokenAcaoProps;

  private constructor(props: TokenAcaoProps) {
    this.props = props;
  }

  static create(data: {
    usuarioId: string;
    token: string;
    tipo: TipoTokenAcao;
    expiraEm: Date;
  }): TokenAcao {
    return new TokenAcao({
      id: crypto.randomUUID(),
      usuarioId: data.usuarioId,
      token: data.token,
      tipo: data.tipo,
      usado: false,
      expiraEm: data.expiraEm,
      criadoEm: new Date(),
    });
  }

  static restore(props: TokenAcaoProps): TokenAcao {
    return new TokenAcao(props);
  }

  marcarComoUsado(): void {
    this.props.usado = true;
  }

  estaExpirado(): boolean {
    return this.props.expiraEm < new Date();
  }

  estaValido(): boolean {
    return !this.props.usado && !this.estaExpirado();
  }

  get id(): string {
    return this.props.id;
  }
  get usuarioId(): string {
    return this.props.usuarioId;
  }
  get token(): string {
    return this.props.token;
  }
  get tipo(): TipoTokenAcao {
    return this.props.tipo;
  }
  get usado(): boolean {
    return this.props.usado;
  }
  get expiraEm(): Date {
    return this.props.expiraEm;
  }
  get criadoEm(): Date {
    return this.props.criadoEm;
  }
}
