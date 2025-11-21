import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';

/**
 * Helmet.js security middleware configuration
 * Provides protection against various vulnerabilities
 */

/**
 * Complete helmet configuration for production
 */
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false, // Disabled for API servers
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginOpenerPolicy: false, // Not applicable for API servers
  dnsPrefetchControl: { allow: false },
  frameguard: {
    action: 'deny',
  },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000, // 1 year in seconds
    includeSubDomains: true,
    preload: true,
  },
  ieNoOpen: true,
  noSniff: true,
  permittedCrossDomainPolicies: {
    permittedPolicies: 'none',
  },
  referrerPolicy: {
    policy: 'no-referrer',
  },
  xssFilter: true,
});

/**
 * Custom CORS middleware for API
 * Configurable by environment
 */
export function corsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const allowedOrigins = getAllowedOrigins();
  const origin = req.headers.origin as string;

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS, PATCH',
    );
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With',
    );
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }

  next();
}

/**
 * Get allowed CORS origins based on environment
 */
function getAllowedOrigins(): string[] {
  const env = process.env.NODE_ENV || 'development';
  const envOrigins = process.env.ALLOWED_ORIGINS;

  // Development: allow localhost
  if (env === 'development') {
    return [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:8080',
      'http://127.0.0.1:3000',
    ];
  }

  // Production: use environment variable
  if (envOrigins) {
    return envOrigins.split(',').map((origin) => origin.trim());
  }

  // Fallback: no CORS
  return [];
}

/**
 * Custom security headers middleware
 */
export function customSecurityHeaders(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Disable browser caching for sensitive data
  res.setHeader(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, proxy-revalidate',
  );
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  // Remove server signature
  res.removeHeader('Server');
  res.removeHeader('X-Powered-By');

  // Set secure cookie flags
  res.setHeader('Set-Cookie', [
    'SameSite=Strict',
    'Secure', // Only if HTTPS
    'HttpOnly', // JavaScript can't access cookies
  ]);

  // API version header
  res.setHeader('X-API-Version', '1.0.0');

  // Request ID for tracking
  const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  res.setHeader('X-Request-ID', requestId);
  (req as unknown as Record<string, unknown>).id = requestId;

  next();
}

/**
 * Strict transport security middleware
 * Ensures HTTPS communication
 */
export function hstsMiddleware(
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  const env = process.env.NODE_ENV || 'development';

  // Only enforce in production
  if (env === 'production') {
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload',
    );
  }

  next();
}

/**
 * X-Frame-Options middleware
 * Prevents clickjacking attacks
 */
export function clickjackProtection(
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  res.setHeader('X-Frame-Options', 'DENY');
  next();
}
