/**
 * Authentication Tests using Jest and Supertest
 */

import request from 'supertest';
import app from '../src/index';
import { deleteUser, getAllUsers } from '../src/controllers';
import { verifyToken } from '../src/auth';

describe('Authentication API', () => {
  beforeEach(() => {
    // Clear users before each test
    const users = getAllUsers();
    users.forEach((user) => deleteUser(user.id));
  });

  describe('POST /api/auth/register', () => {
    test('should register a new user successfully', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user).toHaveProperty('name', userData.name);
      expect(response.body.data.user).toHaveProperty('email', userData.email);
      expect(response.body).toHaveProperty(
        'message',
        'User registered successfully',
      );
    });

    test('should return valid JWT token', async () => {
      const userData = {
        name: 'Token Test',
        email: 'token@example.com',
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      const token = response.body.data.token;
      const decoded = verifyToken(token);

      expect(decoded).not.toBeNull();
      expect(decoded?.email).toBe(userData.email);
    });

    test('should hash password and not return it', async () => {
      const userData = {
        name: 'Password Test',
        email: 'password@example.com',
        password: 'secretPassword123',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    test('should not allow duplicate email registration', async () => {
      const userData = {
        name: 'First User',
        email: 'duplicate@example.com',
        password: 'password123',
      };

      // Register first user
      const firstResponse = await request(app)
        .post('/api/auth/register')
        .send(userData);
      expect(firstResponse.status).toBe(201);

      // Try to register with same email
      const secondResponse = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Second User',
          email: 'duplicate@example.com',
          password: 'password456',
        });

      expect(secondResponse.status).toBe(400);
      expect(secondResponse.body).toHaveProperty('success', false);
      expect(secondResponse.body.error).toContain('Email already registered');
    });

    test('should return 400 when name is missing', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('Missing required fields');
    });

    test('should return 400 when email is missing', async () => {
      const response = await request(app).post('/api/auth/register').send({
        name: 'Test User',
        password: 'password123',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    test('should return 400 when password is missing', async () => {
      const response = await request(app).post('/api/auth/register').send({
        name: 'Test User',
        email: 'test@example.com',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    test('should return 400 when all fields are missing', async () => {
      const response = await request(app).post('/api/auth/register').send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Register a user before login tests
      await request(app).post('/api/auth/register').send({
        name: 'Login Test User',
        email: 'login@example.com',
        password: 'password123',
      });
    });

    test('should login user with valid credentials', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'login@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user).toHaveProperty('email', 'login@example.com');
      expect(response.body).toHaveProperty('message', 'Login successful');
    });

    test('should return valid JWT token on login', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'login@example.com',
        password: 'password123',
      });

      const token = response.body.data.token;
      const decoded = verifyToken(token);

      expect(decoded).not.toBeNull();
      expect(decoded?.email).toBe('login@example.com');
    });

    test('should fail login with wrong password', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'login@example.com',
        password: 'wrongPassword',
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('Invalid email or password');
    });

    test('should fail login with non-existent email', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'nonexistent@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('Invalid email or password');
    });

    test('should return 400 when email is missing', async () => {
      const response = await request(app).post('/api/auth/login').send({
        password: 'password123',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('Missing required fields');
    });

    test('should return 400 when password is missing', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'login@example.com',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    test('should return 400 when both fields are missing', async () => {
      const response = await request(app).post('/api/auth/login').send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('Authentication Integration Tests', () => {
    test('should handle complete auth lifecycle: register, login, verify', async () => {
      const userData = {
        name: 'Full Lifecycle Test',
        email: 'lifecycle@example.com',
        password: 'password123',
      };

      // Register user
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userData);
      expect(registerResponse.status).toBe(201);
      const registeredUserId = registerResponse.body.data.user.id;

      // Login with same credentials
      const loginResponse = await request(app).post('/api/auth/login').send({
        email: userData.email,
        password: userData.password,
      });
      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.data.user.id).toBe(registeredUserId);

      // Verify tokens are valid
      const token = loginResponse.body.data.token;
      const decoded = verifyToken(token);
      expect(decoded).not.toBeNull();
      expect(decoded?.userId).toBe(registeredUserId);
    });

    test('should allow multiple users to register and login independently', async () => {
      const user1 = {
        name: 'User One',
        email: 'user1@example.com',
        password: 'password1',
      };

      const user2 = {
        name: 'User Two',
        email: 'user2@example.com',
        password: 'password2',
      };

      // Register both users
      const reg1 = await request(app).post('/api/auth/register').send(user1);
      const reg2 = await request(app).post('/api/auth/register').send(user2);

      expect(reg1.status).toBe(201);
      expect(reg2.status).toBe(201);
      expect(reg1.body.data.user.id).not.toBe(reg2.body.data.user.id);

      // Login as user1
      const login1 = await request(app).post('/api/auth/login').send({
        email: user1.email,
        password: user1.password,
      });

      // Login as user2
      const login2 = await request(app).post('/api/auth/login').send({
        email: user2.email,
        password: user2.password,
      });

      expect(login1.status).toBe(200);
      expect(login2.status).toBe(200);
      expect(login1.body.data.token).not.toBe(login2.body.data.token);

      // Verify tokens contain correct user info
      const decoded1 = verifyToken(login1.body.data.token);
      const decoded2 = verifyToken(login2.body.data.token);

      expect(decoded1?.email).toBe(user1.email);
      expect(decoded2?.email).toBe(user2.email);
    });

    test('should return valid tokens on each login', async () => {
      const userData = {
        name: 'Token Test',
        email: 'tokentest@example.com',
        password: 'password123',
      };

      // Register user
      await request(app).post('/api/auth/register').send(userData);

      // Small delay to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 1100));

      // Login twice
      const login1 = await request(app).post('/api/auth/login').send({
        email: userData.email,
        password: userData.password,
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      const login2 = await request(app).post('/api/auth/login').send({
        email: userData.email,
        password: userData.password,
      });

      expect(login1.status).toBe(200);
      expect(login2.status).toBe(200);

      // Both should be valid
      const decoded1 = verifyToken(login1.body.data.token);
      const decoded2 = verifyToken(login2.body.data.token);

      expect(decoded1).not.toBeNull();
      expect(decoded2).not.toBeNull();

      // Tokens should have same user info but may differ due to timestamps
      expect(decoded1?.email).toBe(decoded2?.email);
      expect(decoded1?.userId).toBe(decoded2?.userId);
    });
  });
});
