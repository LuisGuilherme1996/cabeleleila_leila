interface RefreshTokenProps {
  id: string;
  usuarioId: string;
  token: string;
  revogado: boolean;
  expiraEm: Date;
  criadoEm: Date;
}

export class RefreshToken {
  private props: RefreshTokenProps;

  private constructor(props: RefreshTokenProps) {
    this.props = props;
  }

  static create(data: { usuarioId: string; token: string; expiraEm: Date }): RefreshToken {
    return new RefreshToken({
      id: crypto.randomUUID(),
      usuarioId: data.usuarioId,
      token: data.token,
      revogado: false,
      expiraEm: data.expiraEm,
      criadoEm: new Date(),
    });
  }

  static restore(props: RefreshTokenProps): RefreshToken {
    return new RefreshToken(props);
  }

  revogar(): void {
    this.props.revogado = true;
  }

  estaExpirado(): boolean {
    return this.props.expiraEm < new Date();
  }

  estaRevogado(): boolean {
    return this.props.revogado;
  }

  estaValido(): boolean {
    return !this.estaRevogado() && !this.estaExpirado();
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
  get revogado(): boolean {
    return this.props.revogado;
  }
  get expiraEm(): Date {
    return this.props.expiraEm;
  }
  get criadoEm(): Date {
    return this.props.criadoEm;
  }
}
