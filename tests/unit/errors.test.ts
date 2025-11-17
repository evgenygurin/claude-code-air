import {
  AppError,
  ValidationError,
  AuthenticationError,
  NotFoundError,
  ConflictError,
  InternalServerError,
} from '../../src/errors';

describe('Error Classes', () => {
  describe('AppError', () => {
    test('should create AppError with message and status code', () => {
      const error = new AppError('Test error', 500, true);

      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(true);
      expect(error instanceof Error).toBe(true);
    });

    test('should create AppError as operational by default', () => {
      const error = new AppError('Test error', 400);

      expect(error.isOperational).toBe(true);
    });
  });

  describe('ValidationError', () => {
    test('should create ValidationError with 400 status', () => {
      const error = new ValidationError('Invalid input');

      expect(error.message).toBe('Invalid input');
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
      expect(error instanceof AppError).toBe(true);
    });
  });

  describe('AuthenticationError', () => {
    test('should create AuthenticationError with 401 status', () => {
      const error = new AuthenticationError('Invalid credentials');

      expect(error.message).toBe('Invalid credentials');
      expect(error.statusCode).toBe(401);
      expect(error.isOperational).toBe(true);
    });

    test('should create AuthenticationError with default message', () => {
      const error = new AuthenticationError();

      expect(error.message).toBe('Authentication failed');
      expect(error.statusCode).toBe(401);
    });
  });

  describe('NotFoundError', () => {
    test('should create NotFoundError with 404 status', () => {
      const error = new NotFoundError('User');

      expect(error.message).toBe('User not found');
      expect(error.statusCode).toBe(404);
      expect(error.isOperational).toBe(true);
    });

    test('should format error message with resource name', () => {
      const error = new NotFoundError('Resource');

      expect(error.message).toBe('Resource not found');
    });
  });

  describe('ConflictError', () => {
    test('should create ConflictError with 409 status', () => {
      const error = new ConflictError('Email already exists');

      expect(error.message).toBe('Email already exists');
      expect(error.statusCode).toBe(409);
      expect(error.isOperational).toBe(true);
    });
  });

  describe('InternalServerError', () => {
    test('should create InternalServerError with 500 status', () => {
      const error = new InternalServerError('Database connection failed');

      expect(error.message).toBe('Database connection failed');
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(false);
    });

    test('should create InternalServerError with default message', () => {
      const error = new InternalServerError();

      expect(error.message).toBe('Internal server error');
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(false);
    });
  });

  describe('Error inheritance', () => {
    test('should maintain proper prototype chain', () => {
      const validationError = new ValidationError('Test');
      expect(validationError instanceof ValidationError).toBe(true);
      expect(validationError instanceof AppError).toBe(true);
      expect(validationError instanceof Error).toBe(true);
    });

    test('should throw and catch properly', () => {
      expect(() => {
        throw new AuthenticationError('Test');
      }).toThrow(AuthenticationError);
    });
  });
});
