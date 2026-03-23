import { Response, NextFunction } from 'express';
import { apiError } from './apiErrors';

interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

const buckets = new Map<string, TokenBucket>();

const MAX_TOKENS = 100;
const REFILL_INTERVAL_MS = 60_000; // 60 seconds

function refillBucket(bucket: TokenBucket): void {
  const now = Date.now();
  const elapsed = now - bucket.lastRefill;
  if (elapsed >= REFILL_INTERVAL_MS) {
    bucket.tokens = MAX_TOKENS;
    bucket.lastRefill = now;
  }
}

export function rateLimit(req: { apiKeyId?: string }, res: Response, next: NextFunction): void {
  const key = req.apiKeyId;
  if (!key) {
    next();
    return;
  }

  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { tokens: MAX_TOKENS, lastRefill: Date.now() };
    buckets.set(key, bucket);
  }

  refillBucket(bucket);

  const resetTime = Math.ceil((bucket.lastRefill + REFILL_INTERVAL_MS) / 1000);

  res.setHeader('X-RateLimit-Limit', MAX_TOKENS);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, bucket.tokens - 1));
  res.setHeader('X-RateLimit-Reset', resetTime);

  if (bucket.tokens <= 0) {
    const retryAfter = Math.ceil((bucket.lastRefill + REFILL_INTERVAL_MS - Date.now()) / 1000);
    res.setHeader('Retry-After', Math.max(1, retryAfter));
    apiError(res, 'RATE_LIMIT_EXCEEDED', 'Rate limit exceeded. Please retry after the specified time.');
    return;
  }

  bucket.tokens--;
  next();
}

// Cleanup stale buckets every 10 minutes
setInterval(() => {
  const cutoff = Date.now() - REFILL_INTERVAL_MS * 10;
  for (const [key, bucket] of buckets) {
    if (bucket.lastRefill < cutoff) {
      buckets.delete(key);
    }
  }
}, 600_000);
