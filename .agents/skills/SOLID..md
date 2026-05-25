---
name: solid-principles
description: >
  Guia de aplicação dos princípios SOLID em Node.js/TypeScript com exemplos reais.
  Carregue esta skill quando o usuário pedir para aplicar, explicar ou revisar SOLID,
  ou quando detectar violações como God Classes, métodos longos, alto acoplamento,
  herança excessiva, ou interfaces gordas.
---

# SOLID em Node.js/TypeScript

## S — Single Responsibility Principle

> Uma classe/função deve ter **um único motivo para mudar**.

### ❌ Violação

```typescript
class UserService {
  async createUser(data: CreateUserDto) {
    // Valida dados
    if (!data.email.includes('@')) throw new Error('Invalid email');

    // Salva no banco
    const user = await db.query('INSERT INTO users...', [data]);

    // Envia email
    await nodemailer.sendMail({ to: data.email, subject: 'Bem-vindo!' });

    // Loga
    console.log(`User created: ${user.id}`);

    return user;
  }
}
```

### ✅ Correto

```typescript
// Cada classe tem UMA responsabilidade
class UserValidator {
  validate(data: CreateUserDto): void {
    if (!data.email.includes('@')) throw new InvalidEmailError(data.email);
  }
}

class UserRepository {
  async save(data: CreateUserDto): Promise<User> {
    return this.db.query('INSERT INTO users...', [data]);
  }
}

class EmailService {
  async sendWelcome(email: string): Promise<void> {
    await this.mailer.send({ to: email, subject: 'Bem-vindo!' });
  }
}

class CreateUserUseCase {
  constructor(
    private readonly validator: UserValidator,
    private readonly repository: UserRepository,
    private readonly emailService: EmailService,
    private readonly logger: Logger,
  ) {}

  async execute(data: CreateUserDto): Promise<User> {
    this.validator.validate(data);
    const user = await this.repository.save(data);
    await this.emailService.sendWelcome(user.email);
    this.logger.info(`User created: ${user.id}`);
    return user;
  }
}
```

---

## O — Open/Closed Principle

> Aberto para extensão, **fechado para modificação**.

### ❌ Violação

```typescript
class PaymentProcessor {
  process(type: 'credit' | 'pix' | 'boleto', amount: number) {
    if (type === 'credit') {
      /* ... */
    } else if (type === 'pix') {
      /* ... */
    } else if (type === 'boleto') {
      /* ... */
    }
    // Cada novo método de pagamento = modificar esta classe
  }
}
```

### ✅ Correto

```typescript
interface PaymentGateway {
  process(amount: number): Promise<PaymentResult>;
}

class CreditCardGateway implements PaymentGateway {
  async process(amount: number): Promise<PaymentResult> {
    /* ... */
  }
}

class PixGateway implements PaymentGateway {
  async process(amount: number): Promise<PaymentResult> {
    /* ... */
  }
}

class PaymentProcessor {
  constructor(private readonly gateway: PaymentGateway) {}

  async process(amount: number): Promise<PaymentResult> {
    return this.gateway.process(amount); // Nunca muda
  }
}

// Adicionar novo método = nova classe, zero modificação
class BoletoGateway implements PaymentGateway {
  async process(amount: number): Promise<PaymentResult> {
    /* ... */
  }
}
```

---

## L — Liskov Substitution Principle

> Subclasses devem ser **substituíveis** por suas classes base sem quebrar o comportamento.

### ✅ Correto

```typescript
abstract class Storage {
  abstract save(key: string, value: string): Promise<void>;
  abstract get(key: string): Promise<string | null>;
}

class RedisStorage extends Storage {
  async save(key: string, value: string): Promise<void> {
    await this.client.set(key, value);
  }
  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }
}

class InMemoryStorage extends Storage {
  private store = new Map<string, string>();
  async save(key: string, value: string): Promise<void> {
    this.store.set(key, value);
  }
  async get(key: string): Promise<string | null> {
    return this.store.get(key) ?? null;
  }
}

// Cache funciona com qualquer implementação
class CacheService {
  constructor(private readonly storage: Storage) {}
  async set(key: string, value: string) {
    return this.storage.save(key, value);
  }
  async get(key: string) {
    return this.storage.get(key);
  }
}
```

---

## I — Interface Segregation Principle

> Clientes **não devem depender** de interfaces que não utilizam.

### ❌ Violação

```typescript
interface UserRepository {
  findById(id: string): Promise<User>;
  findAll(): Promise<User[]>;
  save(user: User): Promise<User>;
  delete(id: string): Promise<void>;
  generateReport(): Promise<Buffer>; // ❌ repositório não deve gerar relatório
  sendNotification(userId: string): Promise<void>; // ❌ fora do escopo
}
```

### ✅ Correto

```typescript
interface UserReader {
  findById(id: string): Promise<User>;
  findAll(): Promise<User[]>;
}

interface UserWriter {
  save(user: User): Promise<User>;
  delete(id: string): Promise<void>;
}

interface UserRepository extends UserReader, UserWriter {}

// Use case de leitura depende apenas de UserReader
class GetUserUseCase {
  constructor(private readonly repo: UserReader) {}
}

// Use case de escrita depende apenas de UserWriter
class DeleteUserUseCase {
  constructor(private readonly repo: UserWriter) {}
}
```

---

## D — Dependency Inversion Principle

> Módulos de alto nível **não devem depender** de módulos de baixo nível. Ambos devem depender de **abstrações**.

### ❌ Violação

```typescript
class OrderService {
  private db = new PostgresDatabase(); // ❌ acoplado diretamente
  private mailer = new SendGridMailer(); // ❌ acoplado diretamente
}
```

### ✅ Correto

```typescript
// Abstrações (domínio)
interface OrderRepository {
  save(order: Order): Promise<Order>;
}

interface Mailer {
  send(options: MailOptions): Promise<void>;
}

// Implementações concretas (infraestrutura)
class PostgresOrderRepository implements OrderRepository {
  async save(order: Order): Promise<Order> {
    /* ... */
  }
}

class SendGridMailer implements Mailer {
  async send(options: MailOptions): Promise<void> {
    /* ... */
  }
}

// Alto nível depende de abstrações
class CreateOrderUseCase {
  constructor(
    private readonly repository: OrderRepository, // abstração
    private readonly mailer: Mailer, // abstração
  ) {}
}

// Container de DI monta tudo
const useCase = new CreateOrderUseCase(new PostgresOrderRepository(db), new SendGridMailer(apiKey));
```

---

## Detecção de Violações SOLID

Ao revisar código, sinalize:

- `[SRP]` — função/classe com múltiplas responsabilidades
- `[OCP]` — `if/else` ou `switch` baseado em tipo
- `[LSP]` — override que lança erros não esperados pelo contrato
- `[ISP]` — interface com métodos não usados pela maioria dos clientes
- `[DIP]` — `new ConcreteClass()` dentro de classes de negócio
