import { AuthResponse, RegisterRequest, LoginRequest, TokenPayload } from '../types';

export interface IAuthService {
  register(request: RegisterRequest): Promise<AuthResponse>;
  login(request: LoginRequest): Promise<AuthResponse>;
  verifyToken(token: string): TokenPayload;
  verifyRefreshToken(token: string): TokenPayload;
  extractToken(authHeader: string): string;
}
