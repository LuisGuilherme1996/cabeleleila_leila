export type NomePerfil = 'ADMIN' | 'CLIENTE';

interface PerfilProps {
  id: string;
  nome: NomePerfil;
  descricao: string | null;
}

export class Perfil {
  private props: PerfilProps;

  private constructor(props: PerfilProps) {
    this.props = props;
  }

  static restore(props: PerfilProps): Perfil {
    return new Perfil(props);
  }

  get id(): string {
    return this.props.id;
  }
  get nome(): NomePerfil {
    return this.props.nome;
  }
  get descricao(): string | null {
    return this.props.descricao;
  }
}
