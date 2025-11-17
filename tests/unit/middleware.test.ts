import { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../../src/middleware/errorHandler';
import { logger } from '../../src/middleware/logger';
import { ValidationError } from '../../src/errors';

describe('Middleware', () => {
  describe('errorHandler', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: Partial<NextFunction>;

    beforeEach(() => {
      mockReq = {};
      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      mockNext = jest.fn();
    });

    test('should handle AppError correctly', () => {
      const error = new ValidationError('Test error');

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext as NextFunction);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Test error',
        }),
      );
    });

    test('should use correct status code from AppError', () => {
      const error = new ValidationError('Validation failed');

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext as NextFunction);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    test('should handle non-AppError gracefully', () => {
      const error = new Error('Unexpected error');

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext as NextFunction);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Internal server error',
        }),
      );
    });

    test('should log unexpected errors', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Unexpected error');

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext as NextFunction);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Unexpected error:', error);

      consoleErrorSpy.mockRestore();
    });

    test('should preserve error message in response', () => {
      const error = new ValidationError('Missing email field');

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext as NextFunction);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Missing email field',
        }),
      );
    });
  });

  describe('logger', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: Partial<NextFunction>;
    let consoleLogSpy: jest.SpyInstance;

    beforeEach(() => {
      mockReq = {
        method: 'GET',
        path: '/api/users',
      };
      mockRes = {};
      mockNext = jest.fn();
      consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
      consoleLogSpy.mockRestore();
    });

    test('should call next middleware', () => {
      logger(mockReq as Request, mockRes as Response, mockNext as NextFunction);

      expect(mockNext).toHaveBeenCalled();
    });

    test('should log request method and path', () => {
      logger(mockReq as Request, mockRes as Response, mockNext as NextFunction);

      expect(consoleLogSpy).toHaveBeenCalled();
      const logCall = consoleLogSpy.mock.calls[0][0];
      expect(logCall).toContain('GET');
      expect(logCall).toContain('/api/users');
    });

    test('should include timestamp in log', () => {
      logger(mockReq as Request, mockRes as Response, mockNext as NextFunction);

      const logCall = consoleLogSpy.mock.calls[0][0];
      expect(logCall).toMatch(/\d{4}-\d{2}-\d{2}/);
    });

    test('should log POST requests', () => {
      const postReq: Partial<Request> = {
        method: 'POST',
        path: '/api/auth/login',
      };
      consoleLogSpy.mockClear();

      logger(postReq as Request, mockRes as Response, mockNext as NextFunction);

      const logCall = consoleLogSpy.mock.calls[0][0];
      expect(logCall).toContain('POST');
      expect(logCall).toContain('/api/auth/login');
    });

    test('should log DELETE requests', () => {
      const deleteReq: Partial<Request> = {
        method: 'DELETE',
        path: '/api/users/123',
      };
      consoleLogSpy.mockClear();

      logger(deleteReq as Request, mockRes as Response, mockNext as NextFunction);

      const logCall = consoleLogSpy.mock.calls[0][0];
      expect(logCall).toContain('DELETE');
      expect(logCall).toContain('/api/users/123');
    });
  });
});
