import request from 'supertest';
import app from '../src/index';
import { container } from '../src/container';
import { User } from '../src/types';

describe('Authentication API', () => {
  const userRepository = container.getUserRepository();

  beforeEach(() => {
    const users = userRepository.findAll();
    users.forEach((user: User) => userRepository.delete(user.id));
  });

  describe('POST /api/auth/register', () => {
    test('should register a new user successfully', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const response = await request(app).post('/api/auth/register').send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user).toHaveProperty('name', userData.name);
      expect(response.body.data.user).toHaveProperty('email', userData.email);
      expect(response.body).toHaveProperty('message', 'User registered successfully');
    });

    test('should return valid JWT token', async () => {
      const userData = {
        name: 'Token Test',
        email: 'token@example.com',
        password: 'password123',
      };

      const response = await request(app).post('/api/auth/register').send(userData);

      expect(response.status).toBe(201);
      expect(response.body.data.token).toBeTruthy();
      expect(typeof response.body.data.token).toBe('string');
      expect(response.body.data.token.split('.').length).toBe(3);
    });

    test('should hash password and not return it', async () => {
      const userData = {
        name: 'Hash Test',
        email: 'hash@example.com',
        password: 'password123',
      };

      const response = await request(app).post('/api/auth/register').send(userData);

      expect(response.status).toBe(201);
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    test('should not allow duplicate email registration', async () => {
      const userData = {
        name: 'Duplicate Test',
        email: 'duplicate@example.com',
        password: 'password123',
      };

      await request(app).post('/api/auth/register').send(userData);

      const secondResponse = await request(app).post('/api/auth/register').send(userData);

      expect(secondResponse.status).toBe(409);
      expect(secondResponse.body.success).toBe(false);
      expect(secondResponse.body.error).toContain('Email already registered');
    });

    test('should return 400 when name is missing', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const response = await request(app).post('/api/auth/register').send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should return 400 when email is missing', async () => {
      const userData = {
        name: 'Test User',
        password: 'password123',
      };

      const response = await request(app).post('/api/auth/register').send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should return 400 when password is missing', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
      };

      const response = await request(app).post('/api/auth/register').send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should return 400 when all fields are missing', async () => {
      const response = await request(app).post('/api/auth/register').send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Login Test',
          email: 'login@example.com',
          password: 'password123',
        });
    });

    test('should login user with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data.user).toHaveProperty('email', 'login@example.com');
    });

    test('should return valid JWT token on login', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.token).toBeTruthy();
      expect(typeof response.body.data.token).toBe('string');
      expect(response.body.data.token.split('.').length).toBe(3);
    });

    test('should fail login with wrong password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test('should fail login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test('should return 400 when email is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should return 400 when password is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should return 400 when both fields are missing', async () => {
      const response = await request(app).post('/api/auth/login').send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Authentication Integration Tests', () => {
    test('should handle complete auth lifecycle: register, login, verify', async () => {
      const userData = {
        name: 'Lifecycle Test',
        email: 'lifecycle@example.com',
        password: 'password123',
      };

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(registerResponse.status).toBe(201);
      expect(registerResponse.body.data.token).toBeTruthy();

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password,
        });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.data.token).toBeTruthy();
    });

    test('should allow multiple users to register and login independently', async () => {
      const user1 = {
        name: 'User One',
        email: 'user1@example.com',
        password: 'password123',
      };

      const user2 = {
        name: 'User Two',
        email: 'user2@example.com',
        password: 'password456',
      };

      const reg1 = await request(app).post('/api/auth/register').send(user1);
      const reg2 = await request(app).post('/api/auth/register').send(user2);

      expect(reg1.status).toBe(201);
      expect(reg2.status).toBe(201);

      const login1 = await request(app)
        .post('/api/auth/login')
        .send({
          email: user1.email,
          password: user1.password,
        });
      const login2 = await request(app)
        .post('/api/auth/login')
        .send({
          email: user2.email,
          password: user2.password,
        });

      expect(login1.status).toBe(200);
      expect(login2.status).toBe(200);
      expect(login1.body.data.user.id).not.toBe(login2.body.data.user.id);
    });

    test('should return valid tokens on each login', async () => {
      const userData = {
        name: 'Token Test',
        email: 'tokentest@example.com',
        password: 'password123',
      };

      await request(app).post('/api/auth/register').send(userData);

      const login1 = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password,
        });

      await new Promise((resolve) => setTimeout(resolve, 1100));

      const login2 = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password,
        });

      expect(login1.status).toBe(200);
      expect(login2.status).toBe(200);
      expect(login1.body.data.token).toBeTruthy();
      expect(login2.body.data.token).toBeTruthy();
      expect(login1.body.data.user.email).toBe(login2.body.data.user.email);
    });
  });
});
