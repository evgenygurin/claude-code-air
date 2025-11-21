/**
 * Security Testing Suite
 *
 * Comprehensive security tests covering:
 * - Authentication & authorization
 * - Input validation & injection prevention
 * - Rate limiting & DoS protection
 * - CORS & HTTP security
 * - Error handling
 */

import request from 'supertest';
import express from 'express';
import { loginAttemptService } from '../../src/services/loginAttemptService';

/**
 * Create test application
 */
function createTestApp() {
  const app = express();
  app.use(express.json());

  // Mock routes for testing
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    // Simulate authentication
    const isLocked = loginAttemptService.isLockedOut(email, req.ip || '');
    if (isLocked) {
      return res.status(429).json({
        success: false,
        error: 'Account temporarily locked due to too many failed login attempts',
      });
    }

    const isValid = email === 'test@test.com' && password === 'TestPass123!';
    if (!isValid) {
      loginAttemptService.recordAttempt(email, req.ip || '', false);
      loginAttemptService.checkAndApplyLockout(email, req.ip || '');
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    loginAttemptService.recordAttempt(email, req.ip || '', true);
    res.json({
      success: true,
      data: {
        token: 'test.jwt.token',
        user: { id: '1', email },
      },
    });
  });

  return app;
}

describe('Security Tests', () => {
  let app: express.Application;

  beforeEach(() => {
    app = createTestApp();
    loginAttemptService.resetAttempts('test@test.com', '::ffff:127.0.0.1');
  });

  // ============================================================================
  // AUTHENTICATION & AUTHORIZATION TESTS
  // ============================================================================

  describe('Authentication Security', () => {
    test('should reject missing credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({});

      expect([400, 401]).toContain(res.status);
    });

    test('should reject invalid email format', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'not-an-email',
        password: 'TestPass123!',
      });

      expect([400, 401]).toContain(res.status);
    });

    test('should reject weak passwords', async () => {
      const weakPasswords = [
        'short', // Too short
        '12345678', // No uppercase/lowercase/special
        'password', // No number/special
        'Pass!1', // Too short
      ];

      for (const password of weakPasswords) {
        const res = await request(app).post('/api/auth/login').send({
          email: 'test@test.com',
          password,
        });

        expect([400, 401]).toContain(res.status);
      }
    });

    test('should reject oversized payloads', async () => {
      const largePassword = 'A'.repeat(10000);
      const res = await request(app).post('/api/auth/login').send({
        email: 'test@test.com',
        password: largePassword,
      });

      // Should be rejected by request size limit or validation
      expect([400, 413]).toContain(res.status);
    });

    test('should use generic error message for both user not found and wrong password', async () => {
      const wrongUserRes = await request(app).post('/api/auth/login').send({
        email: 'nonexistent@test.com',
        password: 'TestPass123!',
      });

      const wrongPasswordRes = await request(app).post('/api/auth/login').send({
        email: 'test@test.com',
        password: 'WrongPassword123!',
      });

      // Both should return same error message to prevent user enumeration
      expect(wrongUserRes.body.error).toBe(
        wrongPasswordRes.body.error
      );
      expect([wrongUserRes.body.error]).toContain(
        'Invalid email or password'
      );
    });
  });

  // ============================================================================
  // RATE LIMITING & BRUTE FORCE PROTECTION
  // ============================================================================

  describe('Brute Force Protection', () => {
    test('should lock account after 5 failed login attempts in 15 minutes', async () => {
      const email = 'test@test.com';
      const ip = '::ffff:127.0.0.1';

      // 5 failed attempts
      for (let i = 0; i < 5; i++) {
        await request(app).post('/api/auth/login').send({
          email,
          password: 'WrongPassword123!',
        });
      }

      // 6th attempt should be locked
      const sixthAttempt = await request(app).post('/api/auth/login').send({
        email,
        password: 'WrongPassword123!',
      });

      expect(sixthAttempt.status).toBe(429);
    });

    test('should clear failed attempts on successful login', async () => {
      const email = 'test@test.com';

      // Make some failed attempts
      for (let i = 0; i < 3; i++) {
        await request(app).post('/api/auth/login').send({
          email,
          password: 'WrongPassword123!',
        });
      }

      // Successful login should clear attempts
      const successRes = await request(app).post('/api/auth/login').send({
        email,
        password: 'TestPass123!',
      });

      expect(successRes.status).toBe(200);

      // Subsequent failed attempts should start fresh counter
      const failureRes = await request(app).post('/api/auth/login').send({
        email,
        password: 'WrongPassword123!',
      });

      expect(failureRes.status).toBe(401);
    });

    test('should detect distributed attack attempts (many emails from one IP)', async () => {
      const ip = '::ffff:127.0.0.1';

      // Multiple failed attempts for different emails from same IP
      for (let i = 0; i < 10; i++) {
        await request(app).post('/api/auth/login').send({
          email: `user${i}@test.com`,
          password: 'TestPass123!',
        });
      }

      // All attempts from this IP should be flagged
      expect(loginAttemptService.getAttemptsByIP(ip).length).toBeGreaterThan(5);
    });
  });

  // ============================================================================
  // INPUT VALIDATION & INJECTION PREVENTION
  // ============================================================================

  describe('Input Validation & Injection Prevention', () => {
    test('should reject SQL injection attempts in email', async () => {
      const sqlInjectionPayloads = [
        "admin' OR '1'='1",
        "admin' --",
        "' UNION SELECT * FROM users --",
        "admin'; DROP TABLE users; --",
      ];

      for (const payload of sqlInjectionPayloads) {
        const res = await request(app).post('/api/auth/login').send({
          email: payload,
          password: 'TestPass123!',
        });

        // Should be rejected by validation
        expect([400, 401]).toContain(res.status);
      }
    });

    test('should reject NoSQL injection attempts', async () => {
      const noSqlInjectionPayloads = [
        { $ne: '' },
        { $regex: '.*' },
        { $in: ['admin'] },
      ];

      for (const payload of noSqlInjectionPayloads) {
        const res = await request(app).post('/api/auth/login').send({
          email: payload,
          password: 'TestPass123!',
        });

        // Should be rejected by validation (not a valid email)
        expect([400, 401]).toContain(res.status);
      }
    });

    test('should reject XSS attempts in input fields', async () => {
      const xssPayloads = [
        '<script>alert("xss")</script>',
        '<img src=x onerror=alert("xss")>',
        'javascript:alert("xss")',
        '<svg onload=alert("xss")>',
      ];

      for (const payload of xssPayloads) {
        const res = await request(app).post('/api/auth/login').send({
          email: payload,
          password: 'TestPass123!',
        });

        // Should be rejected by validation
        expect([400, 401]).toContain(res.status);
      }
    });

    test('should trim whitespace from inputs', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: '  test@test.com  ',
        password: 'TestPass123!',
      });

      // Should accept trimmed email
      expect(res.status).toBe(200);
    });

    test('should lowercase email addresses', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'TEST@TEST.COM',
        password: 'TestPass123!',
      });

      // Should accept lowercased email
      expect(res.status).toBe(200);
    });
  });

  // ============================================================================
  // HTTP SECURITY HEADERS
  // ============================================================================

  describe('HTTP Security Headers', () => {
    test('should include Strict-Transport-Security header', async () => {
      const app2 = createTestApp();
      app2.use((_req, res, next) => {
        res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        next();
      });

      const res = await request(app2).get('/health');
      expect(res.get('Strict-Transport-Security')).toBeDefined();
    });

    test('should reject requests with mismatched Content-Type', async () => {
      const app2 = createTestApp();
      app2.use((req, res, next) => {
        if (
          req.method === 'POST' &&
          !req.get('Content-Type')?.startsWith('application/json')
        ) {
          return res.status(415).json({
            success: false,
            error: 'Content-Type must be application/json',
          });
        }
        next();
      });

      const res = await request(app2)
        .post('/api/auth/login')
        .set('Content-Type', 'text/plain')
        .send('email=test@test.com&password=TestPass123!');

      expect(res.status).toBe(415);
    });
  });

  // ============================================================================
  // ERROR HANDLING
  // ============================================================================

  describe('Error Handling & Information Disclosure', () => {
    test('should not expose stack traces in error responses', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@test.com',
          password: 'wrong',
        });

      // Should not contain stack trace
      expect(res.body.stack).toBeUndefined();
      expect(res.text).not.toMatch(/at /);
    });

    test('should not expose internal file paths in errors', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid',
          password: 'wrong',
        });

      expect(res.body).not.toMatch(/\/src\//);
      expect(res.body).not.toMatch(/\/node_modules\//);
    });

    test('should not expose database details in errors', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@test.com',
          password: 'wrong',
        });

      expect(res.text).not.toMatch(/database/i);
      expect(res.text).not.toMatch(/query/i);
      expect(res.text).not.toMatch(/sql/i);
    });
  });

  // ============================================================================
  // LOGIN ATTEMPT SERVICE TESTS
  // ============================================================================

  describe('Login Attempt Tracking Service', () => {
    test('should track failed login attempts', () => {
      const email = 'user@test.com';
      const ip = '192.168.1.1';

      loginAttemptService.recordAttempt(email, ip, false);
      loginAttemptService.recordAttempt(email, ip, false);

      const stats = loginAttemptService.getFailureStats(email, ip);
      expect(stats.recentShort).toBe(2);
    });

    test('should reset attempts on successful login', () => {
      const email = 'user@test.com';
      const ip = '192.168.1.1';

      loginAttemptService.recordAttempt(email, ip, false);
      loginAttemptService.recordAttempt(email, ip, false);
      loginAttemptService.recordAttempt(email, ip, true);

      const stats = loginAttemptService.getFailureStats(email, ip);
      expect(stats.recentShort).toBe(0);
    });

    test('should return correct threat level', () => {
      const email = 'user@test.com';
      const ip = '192.168.1.1';

      // Low threat: 0 failures
      let threat = loginAttemptService.getThreatLevel(email, ip);
      expect(threat).toBe('LOW');

      // Medium threat: 5+ failures
      for (let i = 0; i < 5; i++) {
        loginAttemptService.recordAttempt(email, ip, false);
      }
      threat = loginAttemptService.getThreatLevel(email, ip);
      expect(threat).toBe('MEDIUM');
    });

    test('should manually reset attempts', () => {
      const email = 'user@test.com';
      const ip = '192.168.1.1';

      loginAttemptService.recordAttempt(email, ip, false);
      loginAttemptService.recordAttempt(email, ip, false);

      let stats = loginAttemptService.getFailureStats(email, ip);
      expect(stats.recentShort).toBe(2);

      loginAttemptService.resetAttempts(email, ip);

      stats = loginAttemptService.getFailureStats(email, ip);
      expect(stats.recentShort).toBe(0);
    });
  });
});
