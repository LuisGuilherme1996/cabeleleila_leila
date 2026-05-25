---
name: antipatterns
description: >
  Guia de anti-padrões comuns e code smells em arquiteturas Node.js e TypeScript.
  Carregue esta skill para revisar códigos existentes, auditar PRs, refatorar códigos complexos
  ou identificar vulnerabilidades de design na aplicação.
---

# Anti-padrões e Code Smells em Node.js/TypeScript

Abaixo estão listados os anti-padrões mais perigosos no ecossistema Node.js/TypeScript e a maneira correta (Senior) de resolvê-los.

---

## 1. Modelo de Domínio Anêmico (Anemic Domain Model)

**O Problema**: Entidades que servem apenas como "sacos de dados" (apenas getters e setters ou propriedades públicas) sem nenhuma lógica ou validação de regras de negócio. Toda a lógica de negócio acaba vazando para Use Cases ou Services gordos.

### ❌ Anti-padrão (Anêmico)

```typescript
export class Client {
  public id: string;
  public email: string;
  public status: string;
}

// A lógica fica solta no UseCase / Service (duplicável e frágil)
class UpdateClientUseCase {
  async execute(id: string, email: string) {
    const client = await repo.findById(id);
    if (client.status === 'BLOCKED') {
      throw new Error('Blocked client cannot be updated');
    }
    client.email = email;
    await repo.save(client);
  }
}
```

### ✅ Solução (Rich Domain Model / Encapsulamento)

```typescript
export class Client {
  private constructor(
    private readonly id: string,
    private email: string,
    private status: 'ACTIVE' | 'BLOCKED',
  ) {}

  // Lógica de negócio encapsulada dentro da Entidade
  public updateEmail(newEmail: string): void {
    if (this.status === 'BLOCKED') {
      throw new BusinessRuleException('Clientes bloqueados não podem atualizar e-mail.');
    }
    this.email = newEmail;
  }

  public block(): void {
    this.status = 'BLOCKED';
  }
}
```

---

## 2. Vazamento de Modelos do Banco (Database Leakage)

**O Problema**: Expor diretamente os models do ORM (Prisma/TypeORM) nas rotas HTTP (Controllers e DTOs) ou nas regras de negócio de alto nível. Qualquer alteração na estrutura do banco quebra a API e os clientes.

### ❌ Anti-padrão

```typescript
@Controller('users')
export class UserController {
  // Acoplamento direto com a tabela do banco
  @Post()
  async create(@Body() user: PrismaUserTable) {
    return this.db.user.create({ data: user });
  }
}
```

### ✅ Solução (DTOs e Mappers)

```typescript
@Controller('users')
export class UserController {
  @Post()
  async create(@Body() dto: CreateUserDto) {
    // 1. Converte DTO para Domínio
    const userDomain = UserMapper.toDomain(dto);

    // 2. Executa Use Case
    const result = await this.createUserUseCase.execute(userDomain);

    // 3. Converte Domínio para Resposta HTTP Higienizada (DTO de Saída)
    return UserMapper.toResponse(result);
  }
}
```

---

## 3. Engolir Erros (Error Swallowing & Broad Throws)

**O Problema**: Silenciar erros de forma descuidada com `catch (err) {}` ou lançar erros genéricos de texto puro, impedindo diagnósticos e respostas ricas na API.

### ❌ Anti-padrão

```typescript
try {
  await paymentGateway.charge(amount);
} catch (error) {
  // Silencia o erro completamente ou loga de forma pobre
  console.log('Error charging');
}
```

### ✅ Solução (Custom Errors e Hierarquias)

```typescript
try {
  await paymentGateway.charge(amount);
} catch (error) {
  // Transforma erros de terceiros em erros inteligíveis para o domínio do sistema
  throw new PaymentProcessingFailedException(
    'Não foi possível processar a cobrança do agendamento.',
    error instanceof Error ? error.message : String(error),
  );
}
```

---

## 4. O Problema de Consulta N+1 (N+1 Query Problem)

**O Problema**: Fazer consultas repetitivas em loop para obter dados associados do banco, gerando centenas de queries sequenciais desnecessárias.

### ❌ Anti-padrão

```typescript
const appointments = await prisma.appointment.findMany(); // 1 query

// Loop realiza mais N queries individuais adicionais no banco
for (const app of appointments) {
  app.client = await prisma.client.findUnique({ where: { id: app.clientId } });
}
```

### ✅ Solução (Eager Loading / Joins)

```typescript
// Resolve tudo em 1 única query com JOIN robusto
const appointments = await prisma.appointment.findMany({
  include: {
    client: true, // Eager Loading
  },
});
```

---

## 5. Checklist Anti-padrões

- [ ] **Sem models ORM vazando**: As rotas e Casos de Uso estão livres de dependências diretas de tipos de banco (ex: `@prisma/client`)?
- [ ] **Sem `Error` Genérico**: Todos os `throw new Error()` foram substituídos por exceções tipadas de aplicação ou domínio?
- [ ] **Sem Loops de Queries**: Operações em lote (batching) usam carregamento adiantado (`include` ou `joins`) ou `Promise.all` em vez de await sequencial em laços for-of/forEach?
- [ ] **Tratamento de erros assíncronos**: Todas as Promises possuem tratamento estruturado de rejeição e não deixam processos pendentes?
