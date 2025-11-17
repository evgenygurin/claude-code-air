import {
  User,
  AuthResponse,
  RegisterRequest,
  LoginRequest,
  TokenPayload,
} from '../types';
import { IAuthService } from './IAuthService';
import { IJwtService } from './IJwtService';
import { IPasswordService } from './IPasswordService';
import { IUserRepository } from '../repositories/IUserRepository';
import { IdGenerator } from '../utils/IdGenerator';
import { ConflictError, AuthenticationError, ValidationError } from '../errors';

export class AuthService implements IAuthService {
  constructor(
    private readonly jwtService: IJwtService,
    private readonly passwordService: IPasswordService,
    private readonly userRepository: IUserRepository,
  ) {}

  async register(request: RegisterRequest): Promise<AuthResponse> {
    this.validateRegisterRequest(request);

    const existingUser = this.userRepository.findByEmail(request.email);
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    const hashedPassword = await this.passwordService.hash(request.password);
    const user: User = {
      id: IdGenerator.generate('user'),
      name: request.name,
      email: request.email,
      password: hashedPassword,
      createdAt: new Date(),
    };

    this.userRepository.create(user);

    return this.createAuthResponse(user);
  }

  async login(request: LoginRequest): Promise<AuthResponse> {
    this.validateLoginRequest(request);

    const user = this.userRepository.findByEmail(request.email);
    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    const isPasswordValid = await this.passwordService.compare(
      request.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid email or password');
    }

    return this.createAuthResponse(user);
  }

  verifyToken(token: string): TokenPayload {
    return this.jwtService.verifyAccessToken(token);
  }

  verifyRefreshToken(token: string): TokenPayload {
    return this.jwtService.verifyRefreshToken(token);
  }

  extractToken(authHeader: string): string {
    if (!authHeader) {
      throw new ValidationError('Authorization header missing');
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
      throw new ValidationError('Invalid authorization header format');
    }

    return parts[1];
  }

  private createAuthResponse(user: User): AuthResponse {
    const payload: TokenPayload = { userId: user.id, email: user.email };
    const token = this.jwtService.generateAccessToken(payload);
    const refreshToken = this.jwtService.generateRefreshToken(payload);

    return {
      token,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }

  private validateRegisterRequest(request: RegisterRequest): void {
    if (!request.name || !request.email || !request.password) {
      throw new ValidationError(
        'Missing required fields: name, email, password',
      );
    }
  }

  private validateLoginRequest(request: LoginRequest): void {
    if (!request.email || !request.password) {
      throw new ValidationError('Missing required fields: email, password');
    }
  }
}
