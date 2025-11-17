import { config } from './config';
import { InMemoryUserRepository } from './repositories/InMemoryUserRepository';
import { JwtService } from './services/JwtService';
import { PasswordService } from './services/PasswordService';
import { AuthService } from './services/AuthService';
import { UserService } from './services/UserService';
import { IAuthService } from './services/IAuthService';
import { IUserService } from './services/IUserService';
import { IUserRepository } from './repositories/IUserRepository';

class Container {
  private userRepository: IUserRepository;
  private authService: IAuthService;
  private userService: IUserService;

  constructor() {
    this.userRepository = new InMemoryUserRepository();

    const jwtService = new JwtService(config.jwt);
    const passwordService = new PasswordService(config.jwt);

    this.authService = new AuthService(jwtService, passwordService, this.userRepository);
    this.userService = new UserService(this.userRepository);
  }

  getAuthService(): IAuthService {
    return this.authService;
  }

  getUserService(): IUserService {
    return this.userService;
  }

  getUserRepository(): IUserRepository {
    return this.userRepository;
  }
}

export const container = new Container();
