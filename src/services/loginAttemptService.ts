/**
 * Login Attempt Tracking Service
 *
 * Tracks failed login attempts per email and IP address.
 * Implements progressive lockout:
 * - 5 failures in 15 min = 15 min lockout
 * - 10 failures in 1 hour = 1 hour lockout
 * - 20 failures in 24 hours = 24 hour lockout + security alert
 *
 * This prevents brute force attacks while minimizing false positives.
 */

export interface LoginAttempt {
  email: string;
  ipAddress: string;
  timestamp: Date;
  success: boolean;
}

export interface LoginAttemptRecord {
  email: string;
  ipAddress: string;
  attempts: LoginAttempt[];
  lockedUntil?: Date;
  lastAttempt: Date;
}

/**
 * In-memory login attempt tracking
 * TODO: Migrate to Redis for multi-instance deployments
 */
class LoginAttemptService {
  private attempts = new Map<string, LoginAttemptRecord>();
  private readonly ATTEMPT_WINDOW_SHORT = 15 * 60 * 1000; // 15 minutes
  private readonly ATTEMPT_WINDOW_MEDIUM = 60 * 60 * 1000; // 1 hour
  private readonly ATTEMPT_WINDOW_LONG = 24 * 60 * 60 * 1000; // 24 hours

  private readonly FAILURE_THRESHOLD_SHORT = 5; // 5 failures in 15 min
  private readonly FAILURE_THRESHOLD_MEDIUM = 10; // 10 failures in 1 hour
  private readonly FAILURE_THRESHOLD_LONG = 20; // 20 failures in 24 hours

  private readonly LOCKOUT_DURATION_SHORT = 15 * 60 * 1000; // 15 minutes
  private readonly LOCKOUT_DURATION_MEDIUM = 60 * 60 * 1000; // 1 hour
  private readonly LOCKOUT_DURATION_LONG = 24 * 60 * 60 * 1000; // 24 hours

  constructor() {
    // Cleanup old entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Record a login attempt (success or failure)
   */
  public recordAttempt(
    email: string,
    ipAddress: string,
    success: boolean
  ): void {
    const key = this.getKey(email, ipAddress);
    const now = new Date();

    let record = this.attempts.get(key);
    if (!record) {
      record = {
        email,
        ipAddress,
        attempts: [],
        lastAttempt: now,
      };
      this.attempts.set(key, record);
    }

    record.attempts.push({
      email,
      ipAddress,
      timestamp: now,
      success,
    });

    record.lastAttempt = now;

    // Clear lockout on successful login
    if (success) {
      record.lockedUntil = undefined;
      record.attempts = []; // Reset counter
    }
  }

  /**
   * Check if account is currently locked
   */
  public isLockedOut(email: string, ipAddress: string): boolean {
    const record = this.attempts.get(this.getKey(email, ipAddress));
    if (!record || !record.lockedUntil) {
      return false;
    }

    const now = new Date();
    if (now >= record.lockedUntil) {
      record.lockedUntil = undefined;
      return false;
    }

    return true;
  }

  /**
   * Get lockout status and remaining time
   */
  public getLockoutStatus(email: string, ipAddress: string): {
    isLocked: boolean;
    remainingMs?: number;
    unlockTime?: Date;
  } {
    const record = this.attempts.get(this.getKey(email, ipAddress));
    if (!record || !record.lockedUntil) {
      return { isLocked: false };
    }

    const now = new Date();
    if (now >= record.lockedUntil) {
      record.lockedUntil = undefined;
      return { isLocked: false };
    }

    const remainingMs =
      record.lockedUntil.getTime() - now.getTime();
    return {
      isLocked: true,
      remainingMs,
      unlockTime: record.lockedUntil,
    };
  }

  /**
   * Check and apply lockout rules
   * Returns true if account should be locked out
   */
  public checkAndApplyLockout(email: string, ipAddress: string): boolean {
    const record = this.attempts.get(this.getKey(email, ipAddress));
    if (!record) {
      return false;
    }

    const now = new Date();
    const failures = this.getRecentFailures(record, now);

    // Check long-term threshold (20 failures in 24 hours)
    if (failures.long >= this.FAILURE_THRESHOLD_LONG) {
      record.lockedUntil = new Date(
        now.getTime() + this.LOCKOUT_DURATION_LONG
      );
      console.warn(
        `[SECURITY] Account locked (24h): ${email} from ${ipAddress} - 20+ failures in 24h`
      );
      return true;
    }

    // Check medium-term threshold (10 failures in 1 hour)
    if (failures.medium >= this.FAILURE_THRESHOLD_MEDIUM) {
      record.lockedUntil = new Date(
        now.getTime() + this.LOCKOUT_DURATION_MEDIUM
      );
      console.warn(
        `[SECURITY] Account locked (1h): ${email} from ${ipAddress} - 10+ failures in 1h`
      );
      return true;
    }

    // Check short-term threshold (5 failures in 15 minutes)
    if (failures.short >= this.FAILURE_THRESHOLD_SHORT) {
      record.lockedUntil = new Date(
        now.getTime() + this.LOCKOUT_DURATION_SHORT
      );
      console.warn(
        `[SECURITY] Account locked (15m): ${email} from ${ipAddress} - 5+ failures in 15m`
      );
      return true;
    }

    return false;
  }

  /**
   * Get detailed failure stats
   */
  public getFailureStats(email: string, ipAddress: string): {
    recentShort: number; // failures in last 15 min
    recentMedium: number; // failures in last 1 hour
    recentLong: number; // failures in last 24 hours
    isLocked: boolean;
    lockoutUntil?: Date;
  } {
    const record = this.attempts.get(this.getKey(email, ipAddress));
    if (!record) {
      return {
        recentShort: 0,
        recentMedium: 0,
        recentLong: 0,
        isLocked: false,
      };
    }

    const now = new Date();
    const failures = this.getRecentFailures(record, now);

    return {
      recentShort: failures.short,
      recentMedium: failures.medium,
      recentLong: failures.long,
      isLocked: this.isLockedOut(email, ipAddress),
      lockoutUntil: record.lockedUntil,
    };
  }

  /**
   * Manually reset login attempts (e.g., after successful password reset)
   */
  public resetAttempts(email: string, ipAddress: string): void {
    const key = this.getKey(email, ipAddress);
    this.attempts.delete(key);
  }

  /**
   * Get all attempts for an email (from any IP)
   * Useful for detecting distributed attacks
   */
  public getAttemptsByEmail(email: string): LoginAttemptRecord[] {
    const emailAttempts: LoginAttemptRecord[] = [];
    this.attempts.forEach((record, _key) => {
      if (record.email === email) {
        emailAttempts.push(record);
      }
    });
    return emailAttempts;
  }

  /**
   * Get all attempts from an IP (any email)
   * Useful for detecting mass enumeration attacks
   */
  public getAttemptsByIP(ipAddress: string): LoginAttemptRecord[] {
    const ipAttempts: LoginAttemptRecord[] = [];
    this.attempts.forEach((record, _key) => {
      if (record.ipAddress === ipAddress) {
        ipAttempts.push(record);
      }
    });
    return ipAttempts;
  }

  /**
   * Get threat level for monitoring
   * Returns: LOW, MEDIUM, HIGH, CRITICAL
   */
  public getThreatLevel(email: string, ipAddress: string): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const emailAttempts = this.getAttemptsByEmail(email);
    const ipAttempts = this.getAttemptsByIP(ipAddress);
    const stats = this.getFailureStats(email, ipAddress);

    // CRITICAL: Multiple accounts from same IP or 20+ failures
    if (ipAttempts.length > 5 || stats.recentLong >= 20) {
      return 'CRITICAL';
    }

    // HIGH: 10+ failures in 1 hour
    if (stats.recentMedium >= 10 || stats.isLocked) {
      return 'HIGH';
    }

    // MEDIUM: 5+ failures in 15 min
    if (stats.recentShort >= 5) {
      return 'MEDIUM';
    }

    // LOW: Normal activity
    return 'LOW';
  }

  /**
   * Helper: Get unique key for tracking
   */
  private getKey(email: string, ipAddress: string): string {
    return `${email.toLowerCase()}:${ipAddress}`;
  }

  /**
   * Helper: Get failure counts within time windows
   */
  private getRecentFailures(
    record: LoginAttemptRecord,
    now: Date
  ): { short: number; medium: number; long: number } {
    const failures = record.attempts.filter((a) => !a.success);

    const short = failures.filter(
      (a) => now.getTime() - a.timestamp.getTime() < this.ATTEMPT_WINDOW_SHORT
    ).length;

    const medium = failures.filter(
      (a) => now.getTime() - a.timestamp.getTime() < this.ATTEMPT_WINDOW_MEDIUM
    ).length;

    const long = failures.filter(
      (a) => now.getTime() - a.timestamp.getTime() < this.ATTEMPT_WINDOW_LONG
    ).length;

    return { short, medium, long };
  }

  /**
   * Helper: Remove old entries to prevent memory leak
   */
  private cleanup(): void {
    const now = new Date();
    const threshold = now.getTime() - this.ATTEMPT_WINDOW_LONG - 1000; // Keep 24h + buffer

    this.attempts.forEach((record, key) => {
      // Remove if all attempts are older than threshold and not locked
      if (
        !record.lockedUntil &&
        record.attempts.every((a) => a.timestamp.getTime() < threshold)
      ) {
        this.attempts.delete(key);
      }
    });
  }
}

// Singleton instance
export const loginAttemptService = new LoginAttemptService();
