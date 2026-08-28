import { Request, Response, NextFunction } from 'express';
import { REVO_CONFIG } from '../config.js';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const ipBuckets = new Map<string, RateLimitEntry>();
let activeBrowserJobs = 0;

// Periodic cleanup of stale rate-limit buckets every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of ipBuckets.entries()) {
    if (now > entry.resetAt) {
      ipBuckets.delete(ip);
    }
  }
}, 5 * 60 * 1000);

export function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || '127.0.0.1';
}

export function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
  const ip = getClientIp(req);
  const now = Date.now();
  const entry = ipBuckets.get(ip);

  if (!entry || now > entry.resetAt) {
    ipBuckets.set(ip, {
      count: 1,
      resetAt: now + REVO_CONFIG.RATE_LIMITING.WINDOW_MS,
    });
    return next();
  }

  if (entry.count >= REVO_CONFIG.RATE_LIMITING.MAX_REQUESTS_PER_IP) {
    const retryAfterSec = Math.ceil((entry.resetAt - now) / 1000);
    res.setHeader('Retry-After', retryAfterSec);
    return res.status(429).json({
      error: 'Rate limit exceeded. Please wait a moment before requesting another website inspection.',
      status: 'error',
      retryAfterSec,
    });
  }

  entry.count++;
  next();
}

/**
 * Concurrency guard for browser-heavy operations.
 */
export class ConcurrencyGate {
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
}
