import { Redis } from '@upstash/redis';

// Support both Vercel KV and Upstash Redis env var names
// Allow build to succeed without env vars, but fail at runtime if they're missing
const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || 'https://placeholder.upstash.io';
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || 'placeholder_token';

export const redis = new Redis({
  url,
  token,
});

// Runtime validation - will throw when actually used if not configured
function validateRedisConfig() {
  const hasVercelKV = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;
  const hasUpstash = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!hasVercelKV && !hasUpstash) {
    throw new Error('Redis environment variables are not configured. Please set up Vercel KV or Upstash Redis.');
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
