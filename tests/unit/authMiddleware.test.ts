import { Request, Response } from 'express';
import { authMiddleware } from '../../src/middleware/authMiddleware';
import { config } from '../../src/config';
import { JwtService } from '../../src/services/JwtService';

describe('Auth Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;
  const jwtService = new JwtService(config.jwt);

  beforeEach(() => {
    mockReq = {
      headers: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  test('should call next when valid token provided', () => {
    const token = jwtService.generateAccessToken({
      userId: 'user123',
      email: 'test@example.com',
    });

    mockReq.headers = {
      authorization: `Bearer ${token}`,
    };

    authMiddleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  test('should attach userId and email to request', () => {
    const token = jwtService.generateAccessToken({
      userId: 'user123',
      email: 'test@example.com',
    });

    mockReq.headers = {
      authorization: `Bearer ${token}`,
    };

    authMiddleware(mockReq as Request, mockRes as Response, mockNext);

    expect((mockReq as any).userId).toBe('user123');
    expect((mockReq as any).email).toBe('test@example.com');
  });

  test('should return 400 when authorization header missing', () => {
    mockReq.headers = {};

    authMiddleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: 'Missing authorization header',
      }),
    );
    expect(mockNext).not.toHaveBeenCalled();
  });

  test('should return 400 when authorization header without Bearer prefix', () => {
    mockReq.headers = {
      authorization: 'invalid-token',
    };

    authMiddleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
      }),
    );
  });

  test('should return 401 when token is invalid', () => {
    mockReq.headers = {
      authorization: 'Bearer invalid.token.here',
    };

    authMiddleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
      }),
    );
    expect(mockNext).not.toHaveBeenCalled();
  });

  test('should return 401 when token is tampered', () => {
    const token = jwtService.generateAccessToken({
      userId: 'user123',
      email: 'test@example.com',
    });

    const tamperedToken = token.slice(0, -5) + 'xxxxx';

    mockReq.headers = {
      authorization: `Bearer ${tamperedToken}`,
    };

    authMiddleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
      }),
    );
  });

  test('should handle missing Bearer token gracefully', () => {
    mockReq.headers = {
      authorization: 'Bearer ',
    };

    authMiddleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalled();
    expect(mockRes.json).toHaveBeenCalled();
  });
});
