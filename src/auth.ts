/**
 * Authentication service with JWT token handling
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { DecodedToken } from './types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const REFRESH_SECRET =
  process.env.REFRESH_SECRET || 'your-refresh-secret-change-in-production';
const TOKEN_EXPIRY = '15m';
const REFRESH_EXPIRY = '7d';

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Compare password with hash
 */
export async function comparePassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate JWT access token
 */
export function generateToken(
  userId: string,
  email: string,
): { token: string; expiresIn: string } {
  const token = jwt.sign(
    { userId, email },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY },
  );
  return { token, expiresIn: TOKEN_EXPIRY };
}

/**
 * Generate refresh token
 */
export function generateRefreshToken(
  userId: string,
  email: string,
): { refreshToken: string; expiresIn: string } {
  const refreshToken = jwt.sign(
    { userId, email },
    REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRY },
  );
  return { refreshToken, expiresIn: REFRESH_EXPIRY };
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): DecodedToken | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): DecodedToken | null {
  try {
    const decoded = jwt.verify(token, REFRESH_SECRET) as DecodedToken;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Extract token from Authorization header
 */
export function extractToken(authHeader?: string): string | null {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}
