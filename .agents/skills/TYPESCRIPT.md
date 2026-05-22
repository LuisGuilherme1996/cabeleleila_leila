---
name: typescript-patterns
description: >
  Diretrizes de TypeScript avançado e tipagem estrita para sistemas de nível empresarial.
  Carregue esta skill quando o usuário pedir para criar interfaces complexas, generics,
  decorators, type guards, utilitários de tipos ou sempre que precisar garantir a
  máxima segurança de tipos no backend ou frontend.
---

# Advanced TypeScript Patterns

O TypeScript deve ser usado de forma **estrita (strict: true)** e **expressiva** para que o compilador previna bugs em tempo de compilação em vez de tempo de execução.

---

## 1. Regras Fundamentais de Segurança de Tipos

1. **Evite o tipo `any` incondicionalmente**: Use `unknown` se o tipo não for conhecido e faça o narrowing adequado (Type Guards/Zod).
2. **Utilize `readonly`**: Proteja objetos de domínio contra mutações acidentais de estado.
3. **Nomes Declarativos**: Tipos e Interfaces devem expressar o domínio de negócios.
4. **Habilite a checagem estrita de Nulos (`strictNullChecks`)**: Lide explicitamente com valores `null` ou `undefined`.

---

## 2. Inferencia de Tipos a partir de Schemas (Zod)

Em vez de criar uma interface duplicada para DTOs e ter o risco delas dessincronizarem com os validadores de schema, use inferência de tipo:

```typescript
import { z } from 'zod';

export const createClientSchema = z.object({
  name: z.string().min(2, 'O nome deve ter no mínimo 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  phone: z.string().regex(/^\d{10,11}$/, 'Telefone inválido'),
  birthDate: z.string().datetime().optional(),
});

// Infere automaticamente a tipagem exata a partir do schema de validação
export type CreateClientInput = z.infer<typeof createClientSchema>;
```

---

## 3. Type Guards e Narrowing Personalizado

Crie funções que facilitem a tomada de decisão do compilador sobre tipos dinâmicos:

```typescript
interface CorporateClient {
  cnpj: string;
  companyName: string;
}

interface IndividualClient {
  cpf: string;
  fullName: string;
}

type Client = CorporateClient | IndividualClient;

// Custom Type Guards usando a keyword 'is'
export function isCorporateClient(client: Client): client is CorporateClient {
  return (client as CorporateClient).cnpj !== undefined;
}

export function processClient(client: Client) {
  if (isCorporateClient(client)) {
    // Aqui dentro, o compilador TS sabe com 100% de certeza que o cliente tem cnpj e companyName
    console.log(`Pessoa Jurídica: ${client.companyName}`);
  } else {
    // Aqui, sabe que é IndividualClient (fullName e cpf)
    console.log(`Pessoa Física: ${client.fullName}`);
  }
}
```

---

## 4. Tipagem de Domain e Propriedades Opcionais (`Omit`, `Pick`, `Partial`)

Aproveite os Utility Types nativos do TypeScript para evitar criar múltiplas interfaces muito parecidas.

```typescript
export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'ADMIN' | 'CLIENT' | 'EMPLOYEE';
  createdAt: Date;
  updatedAt: Date;
}

// Para criar um usuário, precisamos omitir campos gerados pelo banco de dados ou hash de senha direto
export type CreateUserDTO = Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'passwordHash'> & {
  passwordPlain: string;
};

// Para exibir dados no perfil público, omitimos dados sensíveis e gerados automaticamente
export type PublicUserProfile = Omit<User, 'passwordHash' | 'role' | 'createdAt' | 'updatedAt'>;

// Para atualizar dados, aceitamos propriedades parciais
export type UpdateUserDTO = Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>;
```

---

## 5. Value Objects Tipados (Evitando Stringly-Typed Code)

Substitua tipos primitivos genéricos (`string`) por representações fortes de valor para evitar misturar variáveis:

```typescript
declare const brand: unique symbol;
export type Brand<T, TBrand extends string> = T & { readonly [brand]: TBrand };

// Definição de tipos "branded" (identificadores fortes)
export type ClientId = Brand<string, 'ClientId'>;
export type AppointmentId = Brand<string, 'AppointmentId'>;

function assignAppointment(clientId: ClientId, appointmentId: AppointmentId) {
  // Lógica segura: se tentar passar a ordem invertida das strings, causará erro de compilação
}
```

---

## 6. Checklist TypeScript

- [ ] **Sem `any`**: O arquivo está livre de `any` explícitos e implícitos?
- [ ] **Interfaces vs Types**: Usa `interface` para descrever contratos extensíveis (como Repositórios e Serviços) e `type` para uniões, interseções e DTOs?
- [ ] **Tipagem de Retorno**: Todas as funções expõem explicitamente o tipo de retorno, especialmente funções assíncronas (`Promise<T>`)?
- [ ] **Mutações Evitadas**: Parâmetros de listas são tipados como `ReadonlyArray<T>` se não precisarem ser alterados?
- [ ] **Tratamento Seguro**: Variáveis de erro em blocos catch são tipadas como `unknown` e validadas antes do uso?
