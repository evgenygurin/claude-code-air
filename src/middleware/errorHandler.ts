import { Express, Request, Response, NextFunction } from 'express';
import { AppError } from '../errors';
import { ResponseBuilder } from '../utils/ResponseBuilder';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    const statusCode = err.statusCode;
    const response = ResponseBuilder.error(err.message);
    res.status(statusCode).json(response);
  } else {
    console.error('Unexpected error:', err);
    const response = ResponseBuilder.error('Internal server error');
    res.status(500).json(response);
  }
}

export function setupErrorHandler(app: Express): void {
  app.use(errorHandler);
}
