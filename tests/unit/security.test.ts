import { Request, Response, NextFunction } from 'express';
import request from 'supertest';
import express from 'express';
import { apiLimiter, authLimiter, strictLimiter } from '../../src/middleware/rateLimitMiddleware';
import { helmetConfig } from '../../src/middleware/securityHeaders';
import {
  validateBody,
  validateQuery,
  validateParams,
} from '../../src/middleware/validationMiddleware';
import {
  RegisterRequestSchema,
  LoginRequestSchema,
  CreateUserRequestSchema,
  UpdateUserRequestSchema,
  PaginationSchema,
} from '../../src/validation/schemas';
import { ValidationError } from '../../src/errors';

describe('Security Middleware Tests', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    // Apply security headers middleware
    app.use(helmetConfig);
  });

  describe('Rate Limiting', () => {
    it('should have API rate limiter defined', () => {
      expect(apiLimiter).toBeDefined();
      expect(typeof apiLimiter).toBe('function');
    });

    it('should have auth rate limiter defined', () => {
      expect(authLimiter).toBeDefined();
      expect(typeof authLimiter).toBe('function');
    });

    it('should have strict rate limiter defined', () => {
      expect(strictLimiter).toBeDefined();
      expect(typeof strictLimiter).toBe('function');
    });
  });

  describe('Security Headers', () => {
    it('should set security headers correctly', async () => {
      app.get('/test', (_req: Request, res: Response) => {
        res.json({ message: 'test' });
      });

      const response = await request(app).get('/test');

      // Check for basic security headers that helmet should set
      expect(response.headers).toBeDefined();
      // X-Frame-Options should be set by helmet
      expect(response.headers['x-frame-options']).toBeDefined();
    });

    it('should handle CORS preflight requests', async () => {
      app.options('/test', (_req: Request, res: Response) => {
        res.sendStatus(200);
      });

      const response = await request(app)
        .options('/test')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'POST');

      expect(response.status).toBe(200);
    });
  });

  describe('Validation Middleware', () => {
    describe('validateBody', () => {
      it('should validate valid registration request', () => {
        const validData = {
          name: 'John Doe',
          email: 'john@example.com',
          password: 'SecurePass123!',
        };

        const req = { body: validData } as Request;
        const res = {} as Response;
        const next = jest.fn() as NextFunction;

        const middleware = validateBody(RegisterRequestSchema);
        expect(() => middleware(req, res, next)).not.toThrow();
        expect(next).toHaveBeenCalled();
      });

      it('should throw ValidationError for invalid data', () => {
        const invalidData = {
          name: '', // Too short
          email: 'invalid-email',
          password: 'weak',
        };

        const req = { body: invalidData } as Request;
        const res = {} as Response;
        const next = jest.fn() as NextFunction;

        const middleware = validateBody(RegisterRequestSchema);
        expect(() => middleware(req, res, next)).toThrow(ValidationError);
        expect(next).not.toHaveBeenCalled();
      });

      it('should handle login validation', () => {
        const validLoginData = {
          email: 'john@example.com',
          password: 'anypassword',
        };

        const req = { body: validLoginData } as Request;
        const res = {} as Response;
        const next = jest.fn() as NextFunction;

        const middleware = validateBody(LoginRequestSchema);
        expect(() => middleware(req, res, next)).not.toThrow();
        expect(next).toHaveBeenCalled();
      });

      it('should handle create user validation', () => {
        const validUserData = {
          name: 'Jane Doe',
          email: 'jane@example.com',
        };

        const req = { body: validUserData } as Request;
        const res = {} as Response;
        const next = jest.fn() as NextFunction;

        const middleware = validateBody(CreateUserRequestSchema);
        expect(() => middleware(req, res, next)).not.toThrow();
        expect(next).toHaveBeenCalled();
      });

      it('should handle update user validation with partial data', () => {
        const partialUserData = {
          name: 'Jane Updated',
          // email is optional for updates
        };

        const req = { body: partialUserData } as Request;
        const res = {} as Response;
        const next = jest.fn() as NextFunction;

        const middleware = validateBody(UpdateUserRequestSchema);
        expect(() => middleware(req, res, next)).not.toThrow();
        expect(next).toHaveBeenCalled();
      });
    });

    describe('validateQuery', () => {
      it('should validate pagination query parameters', () => {
        const req = { query: { limit: '20', offset: '10' } } as unknown as Request;
        const res = {} as Response;
        const next = jest.fn() as NextFunction;

        const middleware = validateQuery(PaginationSchema);
        expect(() => middleware(req, res, next)).not.toThrow();
        expect(next).toHaveBeenCalled();
      });

      it('should use defaults for missing query parameters', () => {
        const req = { query: {} } as unknown as Request;
        const res = {} as Response;
        const next = jest.fn() as NextFunction;

        const middleware = validateQuery(PaginationSchema);
        expect(() => middleware(req, res, next)).not.toThrow();
        expect(next).toHaveBeenCalled();
      });

      it('should throw ValidationError for invalid query', () => {
        const req = { query: { invalid: 'data' } } as unknown as Request;
        const res = {} as Response;
        const next = jest.fn() as NextFunction;

        const middleware = validateQuery(RegisterRequestSchema);
        expect(() => middleware(req, res, next)).toThrow(ValidationError);
        expect(next).not.toHaveBeenCalled();
      });
    });

    describe('validateParams', () => {
      it('should validate route parameters', () => {
        const paramSchema = RegisterRequestSchema.pick({ name: true });
        const req = { params: { name: 'John Doe' } } as unknown as Request;
        const res = {} as Response;
        const next = jest.fn() as NextFunction;

        const middleware = validateParams(paramSchema);
        expect(() => middleware(req, res, next)).not.toThrow();
        expect(next).toHaveBeenCalled();
      });

      it('should throw ValidationError for invalid params', () => {
        const paramSchema = RegisterRequestSchema.pick({ name: true });
        const req = { params: { name: 'X' } } as unknown as Request; // Too short
        const res = {} as Response;
        const next = jest.fn() as NextFunction;

        const middleware = validateParams(paramSchema);
        expect(() => middleware(req, res, next)).toThrow(ValidationError);
        expect(next).not.toHaveBeenCalled();
      });
    });
  });

  describe('Input Sanitization and Security', () => {
    it('should trim whitespace from name field', () => {
      const dataWithWhitespace = {
        name: '  John Doe  ',
        email: 'john@example.com',
        password: 'SecurePass123!',
      };

      const result = RegisterRequestSchema.parse(dataWithWhitespace);
      expect(result.name).toBe('John Doe');
    });

    it('should convert email to lowercase', () => {
      const dataWithUppercase = {
        name: 'John Doe',
        email: 'JOHN@EXAMPLE.COM',
        password: 'SecurePass123!',
      };

      const result = RegisterRequestSchema.parse(dataWithUppercase);
      expect(result.email).toBe('john@example.com');
    });

    it('should enforce password complexity requirements', () => {
      const weakPasswords = [
        'password', // No uppercase, numbers, special chars
        'PASSWORD', // No lowercase, numbers, special chars
        'Password', // No numbers, special chars
        'Password1', // No special chars
        'Pass1!', // Too short
      ];

      weakPasswords.forEach((password) => {
        expect(() => {
          RegisterRequestSchema.parse({
            name: 'John Doe',
            email: 'john@example.com',
            password,
          });
        }).toThrow();
      });
    });

    it('should accept valid complex passwords', () => {
      const strongPasswords = [
        'SecurePass123!',
        'MyP@ssw0rd',
        'Str0ng!Password',
      ];

      strongPasswords.forEach((password) => {
        expect(() => {
          RegisterRequestSchema.parse({
            name: 'John Doe',
            email: 'john@example.com',
            password,
          });
        }).not.toThrow();
      });
    });

    it('should validate email format strictly', () => {
      const invalidEmails = [
        'not-an-email',
        '@example.com',
        'user@',
        'user..user@example.com',
        'user@.com',
      ];

      invalidEmails.forEach((email) => {
        expect(() => {
          LoginRequestSchema.parse({
            email,
            password: 'anypassword',
          });
        }).toThrow();
      });
    });
  });
});