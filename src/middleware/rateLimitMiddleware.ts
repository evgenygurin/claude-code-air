import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

/**
 * Rate limiting middleware configurations for different endpoint groups
 * Prevents abuse and brute force attacks
 */

/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP address
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  skipSuccessfulRequests: false, // Count successful requests
  skipFailedRequests: false, // Count failed requests
  requestWasSuccessful: (_req: Request, res: Response) => res.statusCode < 400,
  keyGenerator: (req: Request) => {
    // Use forwarded IP if behind proxy, otherwise use remote IP
    return (
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      req.socket.remoteAddress ||
      'unknown'
    );
  },
});

/**
 * Authentication rate limiter
 * 5 requests per 15 minutes per IP (stricter for auth endpoints)
 * Prevents brute force attacks on login/register
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message:
    'Too many authentication attempts, please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  keyGenerator: (req: Request) => {
    // Use email from request body if available for more precise limiting
    const email = (req.body?.email as string) || '';
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      req.socket.remoteAddress ||
      'unknown';
    return `${ip}:${email}`;
  },
});

/**
 * Strict rate limiter for sensitive operations
 * 10 requests per hour per IP
 * Used for admin operations or account modifications
 */
export const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 requests per hour
  message:
    'Too many requests for this operation, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  keyGenerator: (req: Request) => {
    return (
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      req.socket.remoteAddress ||
      'unknown'
    );
  },
});

/**
 * Create size limiter middleware
 * Limits request payload size
 */
export function createSizeLimiter(maxSize: string = '10kb') {
  return (_req: Request, res: Response, next: () => void) => {
    const contentLength = parseInt(_req.headers['content-length'] || '0', 10);
    const maxSizeBytes = parseSize(maxSize);

    if (contentLength > maxSizeBytes) {
      res.status(413).json({
        success: false,
        error: `Request payload too large. Maximum size: ${maxSize}`,
      });
      return;
    }

    next();
  };
}

/**
 * Helper function to parse size strings (e.g., "10kb", "1mb")
 */
function parseSize(size: string): number {
  const units: Record<string, number> = {
    b: 1,
    kb: 1024,
    mb: 1024 * 1024,
    gb: 1024 * 1024 * 1024,
  };

  const match = size.match(/^(\d+(?:\.\d+)?)\s*([a-z]+)$/i);
  if (!match) return 1024 * 10; // Default 10kb

  const [, value, unit] = match;
  const multiplier = units[unit.toLowerCase()] || 1;
  return Math.floor(parseFloat(value) * multiplier);
}

/**
 * Request throttling for specific endpoints
 * Allows 3 concurrent requests per IP
 */
const activeRequests = new Map<string, number>();

export function concurrencyLimiter(maxConcurrent: number = 3) {
  return (req: Request, res: Response, next: () => void) => {
    const key =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      req.socket.remoteAddress ||
      'unknown';

    const current = activeRequests.get(key) || 0;

    if (current >= maxConcurrent) {
      res.status(429).json({
        success: false,
        error: 'Too many concurrent requests',
      });
      return;
    }

    activeRequests.set(key, current + 1);

    res.on('finish', () => {
      const updated = (activeRequests.get(key) || 1) - 1;
      if (updated === 0) {
        activeRequests.delete(key);
      } else {
        activeRequests.set(key, updated);
      }
    });

    next();
  };
}
