import { z } from 'zod';

/**
 * Validation schemas for all API endpoints
 * Uses Zod for runtime type safety and validation
 */

// Email validation pattern (RFC 5322 simplified)
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * User Registration Schema
 * Validates: name (2-100 chars), email (valid format), password (8+ chars, complexity)
 */
export const RegisterRequestSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .trim(),
  email: z
    .string()
    .email('Invalid email format')
    .toLowerCase()
    .regex(EMAIL_PATTERN, 'Email must be a valid format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*]/, 'Password must contain at least one special character (!@#$%^&*)'),
});

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

/**
 * User Login Schema
 * Validates: email (valid format), password (non-empty)
 */
export const LoginRequestSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .toLowerCase()
    .regex(EMAIL_PATTERN, 'Email must be a valid format'),
  password: z
    .string()
    .min(1, 'Password is required')
    .max(255, 'Password is invalid'),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

/**
 * Create User Schema (via authenticated endpoint)
 * Validates: name (2-100 chars), email (valid format)
 */
export const CreateUserRequestSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .trim(),
  email: z
    .string()
    .email('Invalid email format')
    .toLowerCase()
    .regex(EMAIL_PATTERN, 'Email must be a valid format'),
});

export type CreateUserRequest = z.infer<typeof CreateUserRequestSchema>;

/**
 * Update User Schema
 * Validates: name (2-100 chars, optional), email (valid format, optional)
 * At least one field must be provided
 */
export const UpdateUserRequestSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must not exceed 100 characters')
      .trim()
      .optional(),
    email: z
      .string()
      .email('Invalid email format')
      .toLowerCase()
      .regex(EMAIL_PATTERN, 'Email must be a valid format')
      .optional(),
  })
  .refine(
    (data) => Object.values(data).some((value) => value !== undefined),
    'At least one field (name or email) must be provided',
  );

export type UpdateUserRequest = z.infer<typeof UpdateUserRequestSchema>;

/**
 * Pagination Query Schema
 * Validates: limit (1-100), offset (0+)
 */
export const PaginationSchema = z.object({
  limit: z
    .string()
    .optional()
    .default('10')
    .transform((val) => Math.max(1, Math.min(100, parseInt(val || '10', 10)))),
  offset: z
    .string()
    .optional()
    .default('0')
    .transform((val) => Math.max(0, parseInt(val || '0', 10))),
});

export type PaginationQuery = z.infer<typeof PaginationSchema>;

/**
 * API Response Schema (success)
 */
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.unknown().optional(),
  message: z.string().optional(),
});

/**
 * API Response Schema (error)
 */
export const ApiErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
});

/**
 * Token Payload Schema
 * Validates JWT token payload structure
 */
export const TokenPayloadSchema = z.object({
  userId: z.string(),
  email: z.string().email(),
  iat: z.number().optional(),
  exp: z.number().optional(),
});

export type TokenPayload = z.infer<typeof TokenPayloadSchema>;
