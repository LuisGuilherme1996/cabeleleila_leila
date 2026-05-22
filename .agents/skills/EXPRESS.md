---
name: express-patterns
description: >
  Padrões de desenvolvimento para Express.js e NestJS no Backend.
  Carregue esta skill quando o usuário solicitar a criação de rotas, middlewares,
  controllers, validadores de requisições, controle de sessões, tratamento global de exceções
  ou middlewares de segurança (CORS, Helmet, Rate Limit).
---

# Web Framework Patterns (Express.js & NestJS)

Esta sub-skill define as convenções inegociáveis para a camada de **Apresentação (Presentation)** do sistema, garantindo rotas limpas, validação robusta e segurança.

---

## 1. Responsabilidade dos Controllers (KISS & SOLID)

Um Controller deve fazer **exclusivamente**:
1. Receber os dados da requisição HTTP (params, query, body, headers).
2. Chamar o validador para garantir a integridade formal dos dados.
3. Invocar o Caso de Uso correspondente passando os dados higienizados.
4. Retornar o status code HTTP adequado e o payload de saída.

> **REGRA DE OURO**: Controllers **NUNCA** acessam banco de dados diretamente e **NUNCA** implementam regras de negócio. Eles são apenas condutores de dados.

### Exemplo em Express (TypeScript)
```typescript
// src/modules/appointments/presentation/controllers/create-appointment.controller.ts
import { Request, Response, NextFunction } from 'express';
import { CreateAppointmentUseCase } from '../../application/use-cases/create-appointment.use-case';
import { appointmentSchema } from '../validators/appointment.validator';

export class CreateAppointmentController {
  constructor(private readonly createAppointmentUseCase: CreateAppointmentUseCase) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // 1. Validação rápida na borda (Zod)
      const validatedInput = appointmentSchema.parse(req.body);

      // 2. Execução do Caso de Uso
      const output = await this.createAppointmentUseCase.execute({
        clientId: req.user.id, // injetado pelo middleware de autenticação
        serviceId: validatedInput.serviceId,
        scheduledAt: validatedInput.scheduledAt,
      });

      // 3. Resposta correta
      res.status(201).json(output);
    } catch (error) {
      next(error); // Encaminha para o middleware global de erros
    }
  }
}
```

### Exemplo correspondente em NestJS
```typescript
// src/modules/appointments/presentation/controllers/create-appointment.controller.ts
import { Controller, Post, Body, UseGuards, Req, HttpCode } from '@nestjs/common';
import { CreateAppointmentUseCase } from '../../application/use-cases/create-appointment.use-case';
import { CreateAppointmentDto } from '../dtos/create-appointment.dto';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';

@Controller('appointments')
export class CreateAppointmentController {
  constructor(private readonly createAppointmentUseCase: CreateAppointmentUseCase) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(201)
  async handle(@Req() req: any, @Body() dto: CreateAppointmentDto) {
    return this.createAppointmentUseCase.execute({
      clientId: req.user.id,
      serviceId: dto.serviceId,
      scheduledAt: dto.scheduledAt,
    });
  }
}
```

---

## 2. Validação Automática na Borda (Zod Middleware)

A validação do schema da requisição impede que dados espúrios sobrecarreguem as camadas internas de aplicação e persistência.

```typescript
// src/shared/presentation/middlewares/validate.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          status: 'fail',
          message: 'Erro de validação de dados.',
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
        return;
      }
      next(error);
    }
  };
};
```

---

## 3. Tratamento Global de Exceções (Global Exception Handler)

Evite vazamento de detalhes do banco ou stack traces de erro em ambiente de produção. Trate exceções de forma homogênea.

```typescript
// src/shared/presentation/middlewares/error-handler.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { DomainError } from '../../errors/domain.error';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Erros de Domínio / Regra de Negócio
  if (error instanceof DomainError) {
    res.status(400).json({
      status: 'fail',
      error: error.name,
      message: error.message,
    });
    return;
  }

  // Erros inesperados (Internal Server Error) - Log Completo apenas no Server
  console.error('[CRITICAL ERROR]:', error);

  res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' 
      ? 'Ocorreu um erro interno no servidor.' 
      : error.message,
  });
};
```

---

## 4. Segurança de Rotas (Middlewares Essenciais)

1. **Helmet**: Configura headers HTTP de segurança para evitar ataques como XSS e Clickjacking.
2. **CORS**: Controla rigidamente quais domínios podem acessar a API (ex: apenas o front Angular).
3. **Rate Limiter**: Previne ataques de DDoS limitando o número de requisições por IP em determinado intervalo de tempo (usando Redis como store).

---

## 5. Checklist Presentation Layer

- [ ] Os controllers contêm zero lógica de banco ou negócio?
- [ ] O tratamento de erros é feito de forma centralizada por um middleware/filtro global?
- [ ] A entrada de dados (body, query, params) é validadas formalmente antes de chamar a aplicação?
- [ ] Os códigos de status HTTP estão corretos (`201` para criação, `200` para sucesso, `400` para erro de validação/domínio, `401` não autenticado, `403` sem permissão)?
- [ ] Senhas ou tokens sensíveis não são logados ou retornados em responses HTTP em texto puro?
