import jwt from 'jsonwebtoken';
import { TokenPayload, DecodedToken } from '../types';
import { IJwtService } from './IJwtService';
import { IJwtConfig } from '../config';
import { AuthenticationError } from '../errors';

export class JwtService implements IJwtService {
  constructor(private readonly config: IJwtConfig) {}

  generateAccessToken(payload: TokenPayload): string {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return jwt.sign(payload, this.config.secret, {
      expiresIn: this.config.accessTokenExpiry,
    } as any);
  }

  generateRefreshToken(payload: TokenPayload): string {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return jwt.sign(payload, this.config.refreshSecret, {
      expiresIn: this.config.refreshTokenExpiry,
    } as any);
  }

  verifyAccessToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, this.config.secret) as DecodedToken;
      return { userId: decoded.userId, email: decoded.email };
    } catch {
      throw new AuthenticationError('Invalid access token');
    }
  }

  verifyRefreshToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, this.config.refreshSecret) as DecodedToken;
      return { userId: decoded.userId, email: decoded.email };
    } catch {
      throw new AuthenticationError('Invalid refresh token');
    }
  }
}
