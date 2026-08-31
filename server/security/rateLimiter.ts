import { Request, Response, NextFunction } from 'express';
import { REVO_CONFIG } from '../config.js';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// Separate maps per operation namespace
const rateLimitStores = new Map<string, Map<string, RateLimitEntry>>();
let activeBrowserJobs = 0;

// User-level active analysis tracking
const activeUserAnalyses = new Map<string, number>();

// Periodic cleanup of stale rate-limit entries every 3 minutes
setInterval(() => {
  const now = Date.now();
  for (const store of rateLimitStores.values()) {
    for (const [key, entry] of store.entries()) {
      if (now > entry.resetAt) {
        store.delete(key);
      }
    }
  }
}, 3 * 60 * 1000);

export function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || '127.0.0.1';
}

/**
 * Creates an Express middleware with operation-specific rate limits.
 */
export function createRateLimiter(options: {
  namespace: string;
  maxRequests: number;
  windowMs: number;
  message?: string;
}) {
  const { namespace, maxRequests, windowMs, message } = options;

  let store = rateLimitStores.get(namespace);
  if (!store) {
    store = new Map<string, RateLimitEntry>();
    rateLimitStores.set(namespace, store);
  }

  return (req: Request, res: Response, next: NextFunction) => {
    const ip = getClientIp(req);
    const userId = (req.headers['x-user-id'] as string) || (req.query?.ownerId as string) || ip;
    const key = `${namespace}:${userId}`;
    const now = Date.now();

    let entry = store!.get(key);

    if (!entry || now > entry.resetAt) {
      entry = {
        count: 1,
        resetAt: now + windowMs,
      };
      store!.set(key, entry);
      return next();
    }

    if (entry.count >= maxRequests) {
      const retryAfterSec = Math.ceil((entry.resetAt - now) / 1000);
      res.setHeader('Retry-After', retryAfterSec);
      return res.status(429).json({
        error: message || `Rate limit exceeded for ${namespace}. Please wait ${retryAfterSec} seconds before retrying.`,
        status: 'error',
        namespace,
        retryAfterSec,
      });
    }

    entry.count++;
    next();
  };
}

// Pre-configured operation rate limiters
export const analysisLimiter = createRateLimiter({
  namespace: 'analysis',
  maxRequests: 5,
  windowMs: 60 * 1000,
  message: 'Website analysis rate limit reached. Please wait a minute before analyzing another site.',
});

export const askLimiter = createRateLimiter({
  namespace: 'ask_revo',
  maxRequests: 15,
  windowMs: 60 * 1000,
  message: 'Ask REVO rate limit reached. Please wait a few seconds before asking another question.',
});

export const compareLimiter = createRateLimiter({
  namespace: 'compare',
  maxRequests: 10,
  windowMs: 60 * 1000,
  message: 'Comparison rate limit reached. Please wait before generating another before/after comparison.',
});

export const readLimiter = createRateLimiter({
  namespace: 'read_record',
  maxRequests: 60,
  windowMs: 60 * 1000,
  message: 'Too many read requests. Please slow down.',
});

export const auditLimiter = createRateLimiter({
  namespace: 'security_audit',
  maxRequests: 10,
  windowMs: 60 * 1000,
  message: 'Security audit endpoint rate limit reached.',
});

// Backward-compatible default export
export const rateLimitMiddleware = analysisLimiter;

/**
 * Concurrency guard for browser-heavy operations and per-user job limits.
 */
export class ConcurrencyGate {
  static MAX_PER_USER_ANALYSES = 2;

  static tryAcquireBrowserSlot(): boolean {
    if (activeBrowserJobs >= REVO_CONFIG.CONCURRENCY.MAX_CONCURRENT_BROWSER_SESSIONS) {
      return false;
    }
    activeBrowserJobs++;
    return true;
  }

  static releaseBrowserSlot(): void {
    if (activeBrowserJobs > 0) {
      activeBrowserJobs--;
    }
  }

  static getActiveSlots(): number {
    return activeBrowserJobs;
  }

  static tryAcquireUserSlot(userId: string): boolean {
    const current = activeUserAnalyses.get(userId) || 0;
    if (current >= ConcurrencyGate.MAX_PER_USER_ANALYSES) {
      return false;
    }
    activeUserAnalyses.set(userId, current + 1);
    return true;
  }

  static releaseUserSlot(userId: string): void {
    const current = activeUserAnalyses.get(userId) || 0;
    if (current > 1) {
      activeUserAnalyses.set(userId, current - 1);
    } else {
      activeUserAnalyses.delete(userId);
    }
  }
}
