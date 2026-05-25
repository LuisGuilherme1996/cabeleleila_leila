import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { getRedisClient } from '../../infrastructure/cache/redis.client.js';

export const authRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'fail',
    error: 'TooManyRequests',
    message: 'Muitas tentativas. Tente novamente em 1 minuto.',
  },
  store: new RedisStore({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sendCommand: ((...args: string[]) => getRedisClient().call(args[0]!, ...args.slice(1))) as any,
  }),
});
