import { Request, Response, NextFunction } from 'express';
import { container } from '../container';
import { ValidationError, AuthenticationError } from '../errors';

interface AuthenticatedRequest extends Request {
  userId?: string;
  email?: string;
}

export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new ValidationError('Missing authorization header');
    }

    const authService = container.getAuthService();
    const token = authService.extractToken(authHeader);
    const decoded = authService.verifyToken(token);

    req.userId = decoded.userId;
    req.email = decoded.email;

    next();
  } catch (error) {
    if (
      error instanceof ValidationError ||
      error instanceof AuthenticationError
    ) {
      res
        .status(error.statusCode)
        .json({ success: false, error: error.message });
    } else {
      res.status(401).json({ success: false, error: 'Authentication failed' });
    }
  }
}
