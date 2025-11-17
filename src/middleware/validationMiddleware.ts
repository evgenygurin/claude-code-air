import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { ValidationError } from '../errors';

/**
 * Request validation middleware using Zod schemas
 * Validates body, query, or params against provided schema
 */
export function validateBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error: unknown) {
      if (error instanceof Error) {
        const message = `Request validation failed: ${error.message}`;
        throw new ValidationError(message);
      }
      throw new ValidationError('Request validation failed');
    }
  };
}

/**
 * Query parameter validation middleware using Zod schemas
 */
export function validateQuery(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const validated = schema.parse(req.query);
      req.query = validated as Record<string, string | string[]>;
      next();
    } catch (error: unknown) {
      if (error instanceof Error) {
        const message = `Query validation failed: ${error.message}`;
        throw new ValidationError(message);
      }
      throw new ValidationError('Query validation failed');
    }
  };
}

/**
 * Route parameters validation middleware using Zod schemas
 */
export function validateParams(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const validated = schema.parse(req.params);
      req.params = validated as Record<string, string>;
      next();
    } catch (error: unknown) {
      if (error instanceof Error) {
        const message = `Parameter validation failed: ${error.message}`;
        throw new ValidationError(message);
      }
      throw new ValidationError('Parameter validation failed');
    }
  };
}
