/**
 * Redis helper — manage rate limit keys for tests.
 */
import { getRedisClient } from '../../src/infrastructure/cache/redis.client.js';

/** Clear all rate limit keys for the localhost IP. */
export async function clearRateLimitKeys(): Promise<void> {
  const redis = getRedisClient();
  // rate-limit-redis default prefix is 'rl:'
  const keys = await redis.keys('rl:*');
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}
