import { Redis } from '@upstash/redis';

// Allow build to succeed without env vars, but fail at runtime if they're missing
const url = process.env.UPSTASH_REDIS_REST_URL || 'https://placeholder.upstash.io';
const token = process.env.UPSTASH_REDIS_REST_TOKEN || 'placeholder_token';

export const redis = new Redis({
  url,
  token,
});

// Runtime validation - will throw when actually used if not configured
function validateRedisConfig() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    throw new Error('Redis environment variables are not configured');
  }
}

// Wrap redis methods to validate config at runtime
const originalGet = redis.get.bind(redis);
const originalSet = redis.set.bind(redis);
const originalDel = redis.del.bind(redis);

(redis as any).get = function(...args: any[]) {
  validateRedisConfig();
  return (originalGet as any)(...args);
};

(redis as any).set = function(...args: any[]) {
  validateRedisConfig();
  return (originalSet as any)(...args);
};

(redis as any).del = function(...args: any[]) {
  validateRedisConfig();
  return (originalDel as any)(...args);
};
