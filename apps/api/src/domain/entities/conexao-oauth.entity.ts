interface ConexaoOAuthProps {
  id: string;
  usuarioId: string;
  provedor: string;
  provedorUsuarioId: string;
  criadoEm: Date;
}

export class ConexaoOAuth {
  private props: ConexaoOAuthProps;

  private constructor(props: ConexaoOAuthProps) {
    this.props = props;
  }

  static create(data: {
    usuarioId: string;
    provedor: string;
    provedorUsuarioId: string;
  }): ConexaoOAuth {
    return new ConexaoOAuth({
      id: crypto.randomUUID(),
      usuarioId: data.usuarioId,
      provedor: data.provedor,
      provedorUsuarioId: data.provedorUsuarioId,
      criadoEm: new Date(),
    });
  }

  static restore(props: ConexaoOAuthProps): ConexaoOAuth {
    return new ConexaoOAuth(props);
  }

  get id(): string {
    return this.props.id;
  }
  get usuarioId(): string {
    return this.props.usuarioId;
  }
  get provedor(): string {
    return this.props.provedor;
  }
  get provedorUsuarioId(): string {
    return this.props.provedorUsuarioId;
  }
  get criadoEm(): Date {
    return this.props.criadoEm;
  }
}
