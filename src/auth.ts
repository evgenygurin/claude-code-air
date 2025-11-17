/**
 * Authentication module with JWT and bcrypt
 */

import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Request, Response, NextFunction } from 'express';

const JWT_SECRET =
  process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRY = '24h';
const REFRESH_EXPIRY = '7d';

/**
 * User credentials storage (in-memory, use database in production)
 */
const userCredentials: Map<string, { email: string; passwordHash: string }> =
  new Map();

/**
 * Hash password with bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Compare password with hash
 */
export async function comparePasswords(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate JWT token
 */
export function generateToken(
  email: string,
  expiresIn: string = JWT_EXPIRY,
): string {
  const options: SignOptions = { expiresIn: expiresIn as any };
  return jwt.sign({ email }, JWT_SECRET, options);
}

/**
 * Generate refresh token
 */
export function generateRefreshToken(email: string): string {
  const options: SignOptions = { expiresIn: REFRESH_EXPIRY as any };
  return jwt.sign({ email, type: 'refresh' }, JWT_SECRET, options);
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): {
  email: string;
  iat: number;
  exp: number;
} | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      email: string;
      iat: number;
      exp: number;
    };
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Register user with email and password
 */
export async function registerUser(
  email: string,
  password: string,
): Promise<{ success: boolean; message: string }> {
  if (userCredentials.has(email)) {
    return { success: false, message: 'User already exists' };
  }

  if (password.length < 6) {
    return {
      success: false,
      message: 'Password must be at least 6 characters',
    };
  }

  const passwordHash = await hashPassword(password);
  userCredentials.set(email, { email, passwordHash });

  return { success: true, message: 'User registered successfully' };
}

/**
 * Authenticate user and return tokens
 */
export async function authenticateUser(
  email: string,
  password: string,
): Promise<{
  success: boolean;
  token?: string;
  refreshToken?: string;
  message?: string;
}> {
  const credentials = userCredentials.get(email);

  if (!credentials) {
    return { success: false, message: 'Invalid email or password' };
  }

  const isPasswordValid = await comparePasswords(
    password,
    credentials.passwordHash,
  );

  if (!isPasswordValid) {
    return { success: false, message: 'Invalid email or password' };
  }

  const token = generateToken(email);
  const refreshToken = generateRefreshToken(email);

  return {
    success: true,
    token,
    refreshToken,
  };
}

/**
 * Authorization middleware
 */
export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({
      success: false,
      error: 'Missing authorization header',
    });
    return;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    res.status(401).json({
      success: false,
      error: 'Invalid authorization header format',
    });
    return;
  }

  const token = parts[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    res.status(401).json({
      success: false,
      error: 'Invalid or expired token',
    });
    return;
  }

  // Attach user info to request
  (req as any).user = decoded;
  next();
}

/**
 * Refresh token handler
 */
export async function refreshTokenHandler(
  refreshToken: string,
): Promise<{ success: boolean; token?: string; message?: string }> {
  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET) as {
      email: string;
      type?: string;
    };

    if (decoded.type !== 'refresh') {
      return { success: false, message: 'Invalid token type' };
    }

    const newToken = generateToken(decoded.email);
    return { success: true, token: newToken };
  } catch (error) {
    return { success: false, message: 'Invalid or expired refresh token' };
  }
}
