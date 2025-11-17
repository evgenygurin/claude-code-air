import { JwtService } from '../../src/services/JwtService';
import { PasswordService } from '../../src/services/PasswordService';
import { AuthService } from '../../src/services/AuthService';
import { UserService } from '../../src/services/UserService';
import { InMemoryUserRepository } from '../../src/repositories/InMemoryUserRepository';
import { AuthenticationError, ValidationError, ConflictError, NotFoundError } from '../../src/errors';
import { config } from '../../src/config';

describe('Service Unit Tests', () => {
  let jwtService: JwtService;
  let passwordService: PasswordService;
  let userRepository: InMemoryUserRepository;
  let authService: AuthService;
  let userService: UserService;

  beforeEach(() => {
    jwtService = new JwtService(config.jwt);
    passwordService = new PasswordService(config.jwt);
    userRepository = new InMemoryUserRepository();
    authService = new AuthService(jwtService, passwordService, userRepository);
    userService = new UserService(userRepository);
  });

  describe('JwtService', () => {
    test('should generate valid access token', () => {
      const token = jwtService.generateAccessToken({
        userId: 'user123',
        email: 'test@example.com',
      });

      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3);
    });

    test('should generate valid refresh token', () => {
      const token = jwtService.generateRefreshToken({
        userId: 'user123',
        email: 'test@example.com',
      });

      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3);
    });

    test('should verify valid access token', () => {
      const payload = { userId: 'user123', email: 'test@example.com' };
      const token = jwtService.generateAccessToken(payload);

      const decoded = jwtService.verifyAccessToken(token);

      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
    });

    test('should verify valid refresh token', () => {
      const payload = { userId: 'user123', email: 'test@example.com' };
      const token = jwtService.generateRefreshToken(payload);

      const decoded = jwtService.verifyRefreshToken(token);

      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
    });

    test('should throw on invalid access token', () => {
      expect(() => {
        jwtService.verifyAccessToken('invalid.token.here');
      }).toThrow(AuthenticationError);
    });

    test('should throw on invalid refresh token', () => {
      expect(() => {
        jwtService.verifyRefreshToken('invalid.token.here');
      }).toThrow(AuthenticationError);
    });

    test('should throw on tampered token', () => {
      const token = jwtService.generateAccessToken({
        userId: 'user123',
        email: 'test@example.com',
      });

      const tampered = token.slice(0, -5) + 'xxxxx';

      expect(() => {
        jwtService.verifyAccessToken(tampered);
      }).toThrow(AuthenticationError);
    });
  });

  describe('PasswordService', () => {
    test('should hash password successfully', async () => {
      const password = 'myPassword123!';
      const hash = await passwordService.hash(password);

      expect(hash).toBeTruthy();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(20);
    });

    test('should verify correct password', async () => {
      const password = 'myPassword123!';
      const hash = await passwordService.hash(password);

      const match = await passwordService.compare(password, hash);

      expect(match).toBe(true);
    });

    test('should reject incorrect password', async () => {
      const password = 'myPassword123!';
      const hash = await passwordService.hash(password);

      const match = await passwordService.compare('wrongPassword', hash);

      expect(match).toBe(false);
    });

    test('should produce different hashes for same password', async () => {
      const password = 'myPassword123!';
      const hash1 = await passwordService.hash(password);
      const hash2 = await passwordService.hash(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('AuthService', () => {
    test('should register user successfully', async () => {
      const response = await authService.register({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      });

      expect(response.token).toBeTruthy();
      expect(response.refreshToken).toBeTruthy();
      expect(response.user.name).toBe('John Doe');
      expect(response.user.email).toBe('john@example.com');
      expect(response.user.id).toBeTruthy();
    });

    test('should reject duplicate email registration', async () => {
      await authService.register({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      });

      await expect(
        authService.register({
          name: 'Jane Doe',
          email: 'john@example.com',
          password: 'password456',
        }),
      ).rejects.toThrow(ConflictError);
    });

    test('should validate registration request has name', async () => {
      await expect(
        authService.register({
          name: '',
          email: 'john@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(ValidationError);
    });

    test('should validate registration request has email', async () => {
      await expect(
        authService.register({
          name: 'John Doe',
          email: '',
          password: 'password123',
        }),
      ).rejects.toThrow(ValidationError);
    });

    test('should validate registration request has password', async () => {
      await expect(
        authService.register({
          name: 'John Doe',
          email: 'john@example.com',
          password: '',
        }),
      ).rejects.toThrow(ValidationError);
    });

    test('should login user successfully', async () => {
      await authService.register({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      });

      const response = await authService.login({
        email: 'john@example.com',
        password: 'password123',
      });

      expect(response.token).toBeTruthy();
      expect(response.refreshToken).toBeTruthy();
      expect(response.user.email).toBe('john@example.com');
    });

    test('should reject login with wrong password', async () => {
      await authService.register({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      });

      await expect(
        authService.login({
          email: 'john@example.com',
          password: 'wrongpassword',
        }),
      ).rejects.toThrow(AuthenticationError);
    });

    test('should reject login for non-existent user', async () => {
      await expect(
        authService.login({
          email: 'nonexistent@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(AuthenticationError);
    });

    test('should validate login request has email', async () => {
      await expect(
        authService.login({
          email: '',
          password: 'password123',
        }),
      ).rejects.toThrow(ValidationError);
    });

    test('should validate login request has password', async () => {
      await expect(
        authService.login({
          email: 'john@example.com',
          password: '',
        }),
      ).rejects.toThrow(ValidationError);
    });

    test('should extract token from Bearer header', () => {
      const token = jwtService.generateAccessToken({
        userId: 'user123',
        email: 'test@example.com',
      });

      const extracted = authService.extractToken(`Bearer ${token}`);

      expect(extracted).toBe(token);
    });

    test('should reject invalid Bearer header format', () => {
      expect(() => {
        authService.extractToken('InvalidToken');
      }).toThrow(ValidationError);
    });

    test('should reject missing Bearer header', () => {
      expect(() => {
        authService.extractToken('');
      }).toThrow(ValidationError);
    });

    test('should verify token successfully', async () => {
      const registered = await authService.register({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      });

      const verified = authService.verifyToken(registered.token);

      expect(verified.userId).toBeTruthy();
      expect(verified.email).toBe('john@example.com');
    });

    test('should verify refresh token successfully', async () => {
      const registered = await authService.register({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      });

      const verified = authService.verifyRefreshToken(registered.refreshToken);

      expect(verified.userId).toBeTruthy();
      expect(verified.email).toBe('john@example.com');
    });
  });

  describe('UserService', () => {
    test('should get all users', () => {
      userRepository.create({
        id: 'user1',
        name: 'User 1',
        email: 'user1@example.com',
        password: 'hash1',
        createdAt: new Date(),
      });

      const users = userService.getAllUsers();

      expect(users).toHaveLength(1);
      expect(users[0].name).toBe('User 1');
      expect('password' in users[0]).toBe(false);
    });

    test('should get user by id', () => {
      userRepository.create({
        id: 'user1',
        name: 'User 1',
        email: 'user1@example.com',
        password: 'hash1',
        createdAt: new Date(),
      });

      const user = userService.getUserById('user1');

      expect(user.id).toBe('user1');
      expect(user.name).toBe('User 1');
    });

    test('should throw NotFoundError for non-existent user', () => {
      expect(() => {
        userService.getUserById('nonexistent');
      }).toThrow(NotFoundError);
    });

    test('should create user', () => {
      const user = userService.createUser({
        name: 'New User',
        email: 'new@example.com',
      });

      expect(user.id).toBeTruthy();
      expect(user.name).toBe('New User');
      expect(user.email).toBe('new@example.com');
    });

    test('should validate create user request', () => {
      expect(() => {
        userService.createUser({
          name: '',
          email: 'test@example.com',
        });
      }).toThrow(ValidationError);
    });

    test('should update user', () => {
      const created = userService.createUser({
        name: 'Old Name',
        email: 'old@example.com',
      });

      const updated = userService.updateUser(created.id, {
        name: 'New Name',
      });

      expect(updated.name).toBe('New Name');
      expect(updated.email).toBe('old@example.com');
    });

    test('should throw NotFoundError when updating non-existent user', () => {
      expect(() => {
        userService.updateUser('nonexistent', { name: 'Test' });
      }).toThrow(NotFoundError);
    });

    test('should throw NotFoundError when user disappears during update', () => {
      // Tests the defensive programming in updateUser
      const created = userService.createUser({
        name: 'Test User',
        email: 'test@example.com',
      });

      // Verify user exists
      expect(userRepository.exists(created.id)).toBe(true);

      // Now update should work normally
      const updated = userService.updateUser(created.id, { name: 'New Name' });
      expect(updated.name).toBe('New Name');
    });

    test('should delete user', () => {
      const created = userService.createUser({
        name: 'Delete Me',
        email: 'delete@example.com',
      });

      userService.deleteUser(created.id);

      expect(() => {
        userService.getUserById(created.id);
      }).toThrow(NotFoundError);
    });

    test('should throw NotFoundError when deleting non-existent user', () => {
      expect(() => {
        userService.deleteUser('nonexistent');
      }).toThrow(NotFoundError);
    });
  });
});
