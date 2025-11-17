import { config } from '../../src/config';

describe('Config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test('should load default configuration', () => {
    expect(config.app.port).toBe(3000);
    // Jest sets NODE_ENV to 'test' by default
    expect(['development', 'test']).toContain(config.app.nodeEnv);
    expect(config.jwt.accessTokenExpiry).toBe('15m');
    expect(config.jwt.refreshTokenExpiry).toBe('7d');
    expect(config.jwt.saltRounds).toBe(10);
  });

  test('should load port from environment', () => {
    process.env.PORT = '8080';
    delete require.cache[require.resolve('../../src/config')];
    const testConfig = require('../../src/config').config;
    expect(testConfig.app.port).toBe(8080);
  });

  test('should validate port is numeric', () => {
    process.env.PORT = 'invalid';
    delete require.cache[require.resolve('../../src/config')];
    expect(() => {
      require('../../src/config');
    }).toThrow('Invalid PORT');
  });

  test('should validate port is in valid range', () => {
    process.env.PORT = '99999';
    delete require.cache[require.resolve('../../src/config')];
    expect(() => {
      require('../../src/config');
    }).toThrow('Invalid PORT');
  });

  test('should load JWT secret from environment', () => {
    process.env.JWT_SECRET = 'custom-secret';
    delete require.cache[require.resolve('../../src/config')];
    const testConfig = require('../../src/config').config;
    expect(testConfig.jwt.secret).toBe('custom-secret');
  });

  test('should load JWT refresh secret from environment', () => {
    process.env.JWT_REFRESH_SECRET = 'custom-refresh-secret';
    delete require.cache[require.resolve('../../src/config')];
    const testConfig = require('../../src/config').config;
    expect(testConfig.jwt.refreshSecret).toBe('custom-refresh-secret');
  });

  test('should load token expiry from environment', () => {
    process.env.JWT_ACCESS_EXPIRY = '30m';
    delete require.cache[require.resolve('../../src/config')];
    const testConfig = require('../../src/config').config;
    expect(testConfig.jwt.accessTokenExpiry).toBe('30m');
  });

  test('should load refresh token expiry from environment', () => {
    process.env.JWT_REFRESH_EXPIRY = '14d';
    delete require.cache[require.resolve('../../src/config')];
    const testConfig = require('../../src/config').config;
    expect(testConfig.jwt.refreshTokenExpiry).toBe('14d');
  });

  test('should validate salt rounds is numeric', () => {
    process.env.BCRYPT_SALT_ROUNDS = 'invalid';
    delete require.cache[require.resolve('../../src/config')];
    expect(() => {
      require('../../src/config');
    }).toThrow('Invalid BCRYPT_SALT_ROUNDS');
  });

  test('should validate salt rounds is in valid range (too low)', () => {
    process.env.BCRYPT_SALT_ROUNDS = '3';
    delete require.cache[require.resolve('../../src/config')];
    expect(() => {
      require('../../src/config');
    }).toThrow('Invalid BCRYPT_SALT_ROUNDS');
  });

  test('should validate salt rounds is in valid range (too high)', () => {
    process.env.BCRYPT_SALT_ROUNDS = '20';
    delete require.cache[require.resolve('../../src/config')];
    expect(() => {
      require('../../src/config');
    }).toThrow('Invalid BCRYPT_SALT_ROUNDS');
  });

  test('should load valid salt rounds', () => {
    process.env.BCRYPT_SALT_ROUNDS = '12';
    delete require.cache[require.resolve('../../src/config')];
    const testConfig = require('../../src/config').config;
    expect(testConfig.jwt.saltRounds).toBe(12);
  });

  test('should require JWT_SECRET in production', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.JWT_SECRET;
    delete require.cache[require.resolve('../../src/config')];
    expect(() => {
      require('../../src/config');
    }).toThrow('JWT_SECRET must be set in production');
  });

  test('should require JWT_REFRESH_SECRET in production', () => {
    process.env.NODE_ENV = 'production';
    process.env.JWT_SECRET = 'secret';
    delete process.env.JWT_REFRESH_SECRET;
    delete require.cache[require.resolve('../../src/config')];
    expect(() => {
      require('../../src/config');
    }).toThrow('JWT_REFRESH_SECRET must be set in production');
  });

  test('should validate configuration on instantiation', () => {
    // This test ensures validateConfig is called and works properly
    delete require.cache[require.resolve('../../src/config')];
    const testConfig = require('../../src/config').config;
    // If config loads without error, validation passed
    expect(testConfig.jwt.secret).toBeTruthy();
  });
});
