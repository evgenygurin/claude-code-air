interface IAppConfig {
  port: number;
  nodeEnv: string;
}

interface IJwtConfig {
  secret: string;
  accessTokenExpiry: string;
  refreshSecret: string;
  refreshTokenExpiry: string;
  saltRounds: number;
}

class Config {
  private readonly appConfig: IAppConfig;
  private readonly jwtConfig: IJwtConfig;

  constructor() {
    this.appConfig = {
      port: this.parsePort(process.env.PORT),
      nodeEnv: process.env.NODE_ENV || 'development',
    };

    this.jwtConfig = {
      secret: process.env.JWT_SECRET || this.getDefaultJwtSecret(),
      accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
      refreshSecret: process.env.JWT_REFRESH_SECRET || this.getDefaultRefreshSecret(),
      refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
      saltRounds: this.parseSaltRounds(process.env.BCRYPT_SALT_ROUNDS),
    };

    this.validateConfig();
  }

  private parsePort(portEnv: string | undefined): number {
    const port = parseInt(portEnv || '3000', 10);
    if (isNaN(port) || port < 1 || port > 65535) {
      throw new Error(`Invalid PORT: ${portEnv}`);
    }
    return port;
  }

  private parseSaltRounds(saltEnv: string | undefined): number {
    const saltRounds = parseInt(saltEnv || '10', 10);
    if (isNaN(saltRounds) || saltRounds < 5 || saltRounds > 15) {
      throw new Error(`Invalid BCRYPT_SALT_ROUNDS: ${saltEnv}`);
    }
    return saltRounds;
  }

  private getDefaultJwtSecret(): string {
    if (this.appConfig.nodeEnv === 'production') {
      throw new Error('JWT_SECRET must be set in production');
    }
    return 'dev-secret-key-change-in-production';
  }

  private getDefaultRefreshSecret(): string {
    if (this.appConfig.nodeEnv === 'production') {
      throw new Error('JWT_REFRESH_SECRET must be set in production');
    }
    return 'dev-refresh-secret-change-in-production';
  }

  private validateConfig(): void {
    if (!this.jwtConfig.secret) {
      throw new Error('JWT configuration is invalid');
    }
  }

  get app(): IAppConfig {
    return this.appConfig;
  }

  get jwt(): IJwtConfig {
    return this.jwtConfig;
  }
}

export const config = new Config();
export type { IAppConfig, IJwtConfig };
