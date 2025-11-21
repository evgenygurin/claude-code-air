/**
 * Audit Logging Middleware
 *
 * Provides comprehensive audit trail for security-sensitive operations.
 * Logs:
 * - All authentication events (login, register, logout, token refresh)
 * - All data modifications (create, update, delete users)
 * - Failed authentication attempts
 * - Rate limit violations
 * - Access to protected resources
 * - Authorization failures
 *
 * Log Format: Structured JSON for easy parsing and correlation
 * Retention: 1 year (configurable by environment)
 * Access: Restricted to security team and compliance
 */

import { Request, Response, NextFunction } from 'express';
import * as fs from 'fs';
import * as path from 'path';

export interface AuditLogEntry {
  timestamp: string;
  eventType: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  userId?: string;
  email?: string;
  action: string;
  resource: string;
  outcome: 'SUCCESS' | 'FAILURE';
  statusCode: number;
  ipAddress: string;
  userAgent?: string;
  requestId: string;
  details?: Record<string, unknown>;
  errorMessage?: string;
}

/**
 * Audit Logger - Handles structured logging to file and optional remote
 */
class AuditLogger {
  private logDirectory: string;
  private logFile: string;
  private remoteEnabled: boolean;
  private remoteEndpoint?: string;

  constructor() {
    this.logDirectory = process.env.AUDIT_LOG_DIR || './logs/audit';
    this.logFile = path.join(this.logDirectory, 'audit.log');
    this.remoteEnabled = process.env.AUDIT_LOG_REMOTE === 'true';
    this.remoteEndpoint = process.env.AUDIT_LOG_ENDPOINT;

    this.ensureLogDirectory();
  }

  private ensureLogDirectory(): void {
    if (!fs.existsSync(this.logDirectory)) {
      fs.mkdirSync(this.logDirectory, { recursive: true });
    }
  }

  /**
   * Log an audit event
   */
  public log(entry: AuditLogEntry): void {
    const logLine = JSON.stringify(entry);

    // Write to local file
    this.writeToFile(logLine);

    // Send to remote logging service if configured
    if (this.remoteEnabled && this.remoteEndpoint) {
      this.sendToRemote(entry).catch((err) => {
        console.error('Failed to send audit log to remote:', err);
      });
    }
  }

  private writeToFile(logLine: string): void {
    try {
      fs.appendFileSync(this.logFile, logLine + '\n');

      // Rotate logs if file size exceeds 100MB
      const stats = fs.statSync(this.logFile);
      if (stats.size > 100 * 1024 * 1024) {
        this.rotateLog();
      }
    } catch (err) {
      console.error('Failed to write audit log:', err);
    }
  }

  private rotateLog(): void {
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const rotatedFile = path.join(
        this.logDirectory,
        `audit.log.${timestamp}`
      );

      if (!fs.existsSync(rotatedFile)) {
        fs.renameSync(this.logFile, rotatedFile);
      }
    } catch (err) {
      console.error('Failed to rotate log:', err);
    }
  }

  private async sendToRemote(entry: AuditLogEntry): Promise<void> {
    if (!this.remoteEndpoint) return;

    try {
      const response = await fetch(this.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.AUDIT_LOG_TOKEN}`,
        },
        body: JSON.stringify(entry),
      });

      if (!response.ok) {
        console.error(`Remote logging failed with status ${response.status}`);
      }
    } catch (err) {
      console.error('Failed to send audit log to remote:', err);
    }
  }
}

// Singleton instance
const auditLogger = new AuditLogger();

/**
 * Middleware: Capture request context for audit logging
 *
 * Attaches request metadata to response locals for audit middleware to use
 */
export function auditContextMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const requestId = req.get('X-Request-ID') || generateRequestId();

  res.locals.auditContext = {
    requestId,
    timestamp: new Date().toISOString(),
    ipAddress: extractIpAddress(req),
    userAgent: req.get('User-Agent'),
    userId: (req as any).user?.id,
    email: (req as any).user?.email,
    method: req.method,
    path: req.path,
    query: req.query,
  };

  next();
}

/**
 * Middleware: Log authentication events
 */
export function logAuthenticationEvent(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  res.on('finish', () => {
    const context = res.locals.auditContext;
    const route = req.path;
    let eventType = '';
    let action = '';

    if (route === '/api/auth/register' && req.method === 'POST') {
      eventType = 'USER_REGISTRATION';
      action = 'Register new account';
    } else if (route === '/api/auth/login' && req.method === 'POST') {
      eventType = 'USER_LOGIN';
      action = 'Authenticate user';
    } else if (route === '/api/auth/logout' && req.method === 'POST') {
      eventType = 'USER_LOGOUT';
      action = 'Logout user';
    } else if (route === '/api/auth/refresh' && req.method === 'POST') {
      eventType = 'TOKEN_REFRESH';
      action = 'Refresh authentication token';
    } else {
      return; // Not an auth route
    }

    const outcome: 'SUCCESS' | 'FAILURE' =
      res.statusCode >= 200 && res.statusCode < 300 ? 'SUCCESS' : 'FAILURE';

    const severity: 'INFO' | 'WARNING' | 'CRITICAL' =
      outcome === 'SUCCESS'
        ? 'INFO'
        : res.statusCode === 401 || res.statusCode === 403
          ? 'WARNING'
          : 'INFO';

    // Don't log exact password or token details
    const requestEmail =
      (req.body as any)?.email || context.email || 'unknown';

    auditLogger.log({
      timestamp: context.timestamp,
      eventType,
      severity,
      userId: context.userId,
      email: requestEmail,
      action,
      resource: route,
      outcome,
      statusCode: res.statusCode,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      requestId: context.requestId,
      details: {
        method: context.method,
        attempt: outcome === 'FAILURE' ? 'failed_auth' : undefined,
      },
    });
  });

  next();
}

/**
 * Middleware: Log data modification events
 */
export function logDataModification(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const modifyingMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];

  if (!modifyingMethods.includes(req.method)) {
    return next();
  }

  res.on('finish', () => {
    const context = res.locals.auditContext;
    const route = req.path;
    const method = req.method;

    // Only log user modification operations
    if (!route.includes('/api/users')) {
      return;
    }

    let action = '';
    let eventType = '';

    if (method === 'POST') {
      eventType = 'USER_CREATED';
      action = 'Create new user';
    } else if (method === 'PUT' || method === 'PATCH') {
      eventType = 'USER_UPDATED';
      action = 'Update user information';
    } else if (method === 'DELETE') {
      eventType = 'USER_DELETED';
      action = 'Delete user account';
    } else {
      return;
    }

    const outcome: 'SUCCESS' | 'FAILURE' =
      res.statusCode >= 200 && res.statusCode < 300 ? 'SUCCESS' : 'FAILURE';

    const severity: 'INFO' | 'WARNING' | 'CRITICAL' =
      outcome === 'SUCCESS'
        ? 'INFO'
        : res.statusCode === 401 || res.statusCode === 403
          ? 'CRITICAL'
          : 'WARNING';

    const userId = route.split('/').pop() || 'unknown';

    auditLogger.log({
      timestamp: context.timestamp,
      eventType,
      severity,
      userId: context.userId,
      email: context.email,
      action,
      resource: route,
      outcome,
      statusCode: res.statusCode,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      requestId: context.requestId,
      details: {
        targetUserId: userId,
        method: context.method,
        modifiedFields:
          method === 'PUT' || method === 'PATCH'
            ? Object.keys(req.body as Record<string, unknown>)
            : undefined,
      },
      errorMessage:
        outcome === 'FAILURE'
          ? `Operation failed with status ${res.statusCode}`
          : undefined,
    });
  });

  next();
}

/**
 * Middleware: Log authorization failures
 */
export function logAuthorizationEvent(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  res.on('finish', () => {
    // Only log 401/403 responses
    if (res.statusCode !== 401 && res.statusCode !== 403) {
      return;
    }

    const context = res.locals.auditContext;
    const isForbidden = res.statusCode === 403;
    const isUnauthorized = res.statusCode === 401;

    auditLogger.log({
      timestamp: context.timestamp,
      eventType: isUnauthorized ? 'UNAUTHORIZED_ACCESS' : 'FORBIDDEN_ACCESS',
      severity: 'WARNING',
      userId: context.userId,
      email: context.email,
      action: isUnauthorized
        ? 'Attempted access without authentication'
        : 'Attempted access without permission',
      resource: req.path,
      outcome: 'FAILURE',
      statusCode: res.statusCode,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      requestId: context.requestId,
      details: {
        method: context.method,
        query: Object.keys(context.query as Record<string, unknown>),
      },
    });
  });

  next();
}

/**
 * Middleware: Log rate limiting violations
 */
export function logRateLimitEvent(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  res.on('finish', () => {
    if (res.statusCode !== 429) {
      return;
    }

    const context = res.locals.auditContext;
    const rateLimitInfo = res.getHeaders();

    auditLogger.log({
      timestamp: context.timestamp,
      eventType: 'RATE_LIMIT_EXCEEDED',
      severity: 'WARNING',
      userId: context.userId,
      email: context.email,
      action: 'Rate limit exceeded',
      resource: req.path,
      outcome: 'FAILURE',
      statusCode: res.statusCode,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      requestId: context.requestId,
      details: {
        method: context.method,
        limitRemaining: rateLimitInfo['ratelimit-remaining'],
        limitReset: rateLimitInfo['ratelimit-reset'],
      },
    });
  });

  next();
}

/**
 * Helper: Extract IP address from request
 * Handles proxy headers (X-Forwarded-For, CF-Connecting-IP, etc.)
 */
function extractIpAddress(req: Request): string {
  const forwardedFor = req.get('X-Forwarded-For');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const cloudflareIP = req.get('CF-Connecting-IP');
  if (cloudflareIP) {
    return cloudflareIP;
  }

  return req.socket.remoteAddress || 'unknown';
}

/**
 * Helper: Generate unique request ID for tracing
 */
function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(7)}`;
}

/**
 * Export audit logging utilities
 */
export { auditLogger };

/**
 * Query audit logs by criteria
 * @param eventType - Filter by event type (optional)
 * @param userId - Filter by user ID (optional)
 * @param startDate - Filter from date (optional)
 * @param endDate - Filter to date (optional)
 * @returns Array of matching log entries
 */
export function queryAuditLogs(
  eventType?: string,
  userId?: string,
  startDate?: Date,
  endDate?: Date
): AuditLogEntry[] {
  try {
    const content = fs.readFileSync(
      path.join(process.env.AUDIT_LOG_DIR || './logs/audit', 'audit.log'),
      'utf-8'
    );

    const logs: AuditLogEntry[] = content
      .split('\n')
      .filter((line) => line.trim())
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter((log) => log !== null);

    // Apply filters
    return logs.filter((log) => {
      if (eventType && log.eventType !== eventType) {
        return false;
      }
      if (userId && log.userId !== userId) {
        return false;
      }
      if (startDate && new Date(log.timestamp) < startDate) {
        return false;
      }
      if (endDate && new Date(log.timestamp) > endDate) {
        return false;
      }
      return true;
    });
  } catch {
    return [];
  }
}

/**
 * Get audit log statistics
 */
export function getAuditStats(): {
  totalEvents: number;
  events: Record<string, number>;
  failureRate: number;
} {
  const logs = queryAuditLogs();
  const events: Record<string, number> = {};
  let failures = 0;

  logs.forEach((log) => {
    events[log.eventType] = (events[log.eventType] || 0) + 1;
    if (log.outcome === 'FAILURE') {
      failures += 1;
    }
  });

  return {
    totalEvents: logs.length,
    events,
    failureRate: logs.length > 0 ? (failures / logs.length) * 100 : 0,
  };
}
