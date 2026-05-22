---
name: dry-kiss-patterns
description: >
  Princípios DRY (Don't Repeat Yourself) e KISS (Keep It Simple, Stupid) aplicados a Node.js/TypeScript.
  Carregue esta skill quando o usuário pedir para refatorar código repetido, simplificar lógica complexa,
  extrair abstrações, criar utilitários reutilizáveis, eliminar duplicação, ou quando o código parecer
  mais complicado do que deveria ser.
---

# DRY & KISS — Node.js/TypeScript

## DRY — Don't Repeat Yourself

> Toda peça de conhecimento deve ter uma **representação única, inequívoca e autoritativa** no sistema.

### Detectando Violações DRY

- Copiar e colar código entre arquivos
- Mesma validação em múltiplos controllers
- Mesma query com pequenas variações
- Constantes mágicas repetidas
- Mesma transformação de dados em vários lugares

---

### Extraindo Lógica Repetida

```typescript
// ❌ Antes: paginação repetida em todo controller
class UsersController {
  async list(req: Request, res: Response) {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    // ...
  }
}

class ProductsController {
  async list(req: Request, res: Response) {
    const page = parseInt(req.query.page as string) || 1; // duplicado
    const limit = parseInt(req.query.limit as string) || 10; // duplicado
    const offset = (page - 1) * limit; // duplicado
    // ...
  }
}

// ✅ Depois: extraído em utilitário
// src/shared/utils/pagination.ts
export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export function parsePagination(query: Record<string, unknown>): PaginationParams {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
  return { page, limit, offset: (page - 1) * limit };
}

export function buildPaginatedResponse<T>(
  items: T[],
  total: number,
  params: PaginationParams,
) {
  return {
    items,
    total,
    page: params.page,
    pageSize: params.limit,
    totalPages: Math.ceil(total / params.limit),
  };
}
```

---

### Repository Base Genérico (DRY em Camada de Dados)

```typescript
// src/shared/infrastructure/BaseRepository.ts
export abstract class BaseRepository<T extends { id: string }> {
  constructor(protected readonly prisma: PrismaClient) {}

  protected abstract mapToDomain(raw: unknown): T;
  protected abstract mapToPersistence(entity: T): unknown;
  protected abstract get modelName(): string;

  async findById(id: string): Promise<T | null> {
    const raw = await (this.prisma as any)[this.modelName].findUnique({ where: { id } });
    return raw ? this.mapToDomain(raw) : null;
  }

  async delete(id: string): Promise<void> {
    await (this.prisma as any)[this.modelName].delete({ where: { id } });
  }
}

// Uso — apenas lógica específica do repositório
class PrismaUserRepository extends BaseRepository<User> implements IUserRepository {
  protected get modelName() { return 'user'; }

  protected mapToDomain(raw: PrismaUser): User {
    return User.restore(raw);
  }

  protected mapToPersistence(user: User) {
    return { id: user.id, email: user.email.value, name: user.name.value };
  }

  // Apenas métodos específicos de User
  async findByEmail(email: string): Promise<User | null> {
    const raw = await this.prisma.user.findUnique({ where: { email } });
    return raw ? this.mapToDomain(raw) : null;
  }
}
```

---

### Eliminando Constantes Mágicas

```typescript
// ❌ Números mágicos espalhados
if (token.length < 32) throw new Error('Token too short');
await redis.expire(key, 900);
const bcryptRounds = 12;

// ✅ Constantes nomeadas e centralizadas
// src/shared/constants/security.ts
export const SECURITY = {
  JWT: {
    MIN_SECRET_LENGTH: 32,
    ACCESS_TOKEN_EXPIRY: '15m',
    REFRESH_TOKEN_EXPIRY: '7d',
  },
  CACHE: {
    SESSION_TTL_SECONDS: 900,
    USER_CACHE_TTL_SECONDS: 300,
  },
  BCRYPT: {
    ROUNDS: 12,
  },
} as const;
```

---

## KISS — Keep It Simple, Stupid

> Se você precisar de um comentário para explicar o que o código faz, o código não é simples o suficiente.

### Funções Pequenas e Focadas

```typescript
// ❌ Função que faz demais
async function processOrder(orderId: string, userId: string, couponCode?: string) {
  const order = await orderRepo.findById(orderId);
  if (!order) throw new Error('Not found');
  if (order.userId !== userId) throw new Error('Forbidden');
  if (order.status !== 'pending') throw new Error('Invalid status');
  
  let discount = 0;
  if (couponCode) {
    const coupon = await couponRepo.findByCode(couponCode);
    if (!coupon || coupon.expiresAt < new Date()) throw new Error('Invalid coupon');
    if (coupon.minOrderValue > order.total) throw new Error('Order too small');
    discount = coupon.discountType === 'percent'
      ? order.total * (coupon.value / 100)
      : coupon.value;
  }
  
  const finalTotal = order.total - discount;
  await paymentService.charge(userId, finalTotal);
  await orderRepo.updateStatus(orderId, 'processing');
  await emailService.sendConfirmation(userId, orderId);
}

// ✅ Funções pequenas e compostas
async function processOrder(orderId: string, userId: string, couponCode?: string) {
  const order = await getValidatedOrder(orderId, userId);
  const discount = couponCode ? await calculateCouponDiscount(couponCode, order) : 0;
  await chargeAndConfirmOrder(order, userId, discount);
}

async function getValidatedOrder(orderId: string, userId: string): Promise<Order> {
  const order = await orderRepo.findById(orderId);
  if (!order) throw new OrderNotFoundError(orderId);
  if (order.userId !== userId) throw new ForbiddenError();
  if (order.status !== 'pending') throw new InvalidOrderStatusError(order.status);
  return order;
}

async function calculateCouponDiscount(code: string, order: Order): Promise<number> {
  const coupon = await getValidCoupon(code, order.total);
  return applyDiscount(order.total, coupon);
}
```

---

### Early Return (Guard Clauses)

```typescript
// ❌ Aninhamento profundo
async function createUser(dto: CreateUserDto) {
  if (dto.email) {
    if (isValidEmail(dto.email)) {
      const exists = await repo.findByEmail(dto.email);
      if (!exists) {
        const user = User.create(dto);
        await repo.save(user);
        return user;
      } else {
        throw new Error('Email already exists');
      }
    } else {
      throw new Error('Invalid email');
    }
  } else {
    throw new Error('Email is required');
  }
}

// ✅ Guard clauses — flat e legível
async function createUser(dto: CreateUserDto) {
  if (!dto.email) throw new ValidationError('Email is required');
  if (!isValidEmail(dto.email)) throw new InvalidEmailError(dto.email);

  const exists = await repo.findByEmail(dto.email);
  if (exists) throw new UserAlreadyExistsError(dto.email);

  const user = User.create(dto);
  await repo.save(user);
  return user;
}
```

---

### Nomes que Eliminam Comentários

```typescript
// ❌ Código que precisa de comentário
// Verifica se o usuário pode acessar o recurso premium
if (user.plan === 'pro' || user.plan === 'enterprise' || user.trialExpiresAt > new Date()) {
  // ...
}

// ✅ Nome que documenta a intenção
function hasPremiumAccess(user: User): boolean {
  const isPaidPlan = ['pro', 'enterprise'].includes(user.plan);
  const isInTrial = user.trialExpiresAt != null && user.trialExpiresAt > new Date();
  return isPaidPlan || isInTrial;
}

if (hasPremiumAccess(user)) { /* ... */ }
```

---

## Checklist DRY/KISS

**DRY:**
- [ ] Existe lógica copiada de outro lugar?
- [ ] Há mais de 1 lugar que precisa mudar se um requisito mudar?
- [ ] Existem constantes mágicas repetidas?

**KISS:**
- [ ] A função tem mais de 20 linhas? (sinal de alerta)
- [ ] Há mais de 2 níveis de aninhamento?
- [ ] O nome da função/variável precisa de comentário para ser entendido?
- [ ] Alguém novo na codebase entenderia sem perguntar?