/**
 * Authentication Tests
 */

import request from 'supertest';
import app from '../src/index';

describe('Authentication API', () => {
  let authToken: string;
  let refreshToken: string;

  describe('POST /api/auth/register', () => {
    test('should register a new user', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'testuser@example.com',
        password: 'Password123',
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('registered');
    });

    test('should reject duplicate email', async () => {
      // First registration
      await request(app).post('/api/auth/register').send({
        email: 'duplicate@example.com',
        password: 'Password123',
      });

      // Try duplicate
      const response = await request(app).post('/api/auth/register').send({
        email: 'duplicate@example.com',
        password: 'Password123',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('already exists');
    });

    test('should reject short password', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'shortpass@example.com',
        password: '123',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('at least 6 characters');
    });

    test('should reject missing email', async () => {
      const response = await request(app).post('/api/auth/register').send({
        password: 'Password123',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('Missing required fields');
    });

    test('should reject missing password', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'nopass@example.com',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('Missing required fields');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeAll(async () => {
      // Register a user for login tests
      await request(app).post('/api/auth/register').send({
        email: 'login@example.com',
        password: 'Password123',
      });
    });

    test('should login successfully and return tokens', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'login@example.com',
        password: 'Password123',
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.message).toContain('successful');

      // Store tokens for later tests
      authToken = response.body.data.token;
      refreshToken = response.body.data.refreshToken;
    });

    test('should reject invalid password', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'login@example.com',
        password: 'WrongPassword',
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('Invalid email or password');
    });

    test('should reject nonexistent user', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'nonexistent@example.com',
        password: 'Password123',
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('Invalid email or password');
    });

    test('should reject missing email', async () => {
      const response = await request(app).post('/api/auth/login').send({
        password: 'Password123',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('Missing required fields');
    });

    test('should reject missing password', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'login@example.com',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('Missing required fields');
    });
  });

  describe('POST /api/auth/refresh', () => {
    test('should refresh token successfully', async () => {
      const response = await request(app).post('/api/auth/refresh').send({
        refreshToken,
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.message).toContain('successfully');
    });

    test('should reject invalid refresh token', async () => {
      const response = await request(app).post('/api/auth/refresh').send({
        refreshToken: 'invalid.token.here',
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('Invalid or expired');
    });

    test('should reject missing refresh token', async () => {
      const response = await request(app).post('/api/auth/refresh').send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('Missing refresh token');
    });
  });

  describe('Protected User Endpoints', () => {
    let token: string;

    beforeAll(async () => {
      // Register and login for token
      await request(app).post('/api/auth/register').send({
        email: 'protected@example.com',
        password: 'Password123',
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'protected@example.com',
          password: 'Password123',
        });

      token = loginResponse.body.data.token;
    });

    test('should reject request without token', async () => {
      const response = await request(app).get('/api/users');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('Missing authorization');
    });

    test('should reject invalid token format', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', 'InvalidFormat token');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('Invalid authorization header format');
    });

    test('should reject invalid token', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', 'Bearer invalid.token.here');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('Invalid or expired token');
    });

    test('should allow GET /api/users with valid token', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('should allow POST /api/users with valid token', async () => {
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Protected User',
          email: 'protected.user@example.com',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('name', 'Protected User');
    });

    test('should allow PUT /api/users/:id with valid token', async () => {
      // Create user first
      const createResponse = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Update Test',
          email: 'update.test@example.com',
        });

      const userId = createResponse.body.data.id;

      // Update user
      const updateResponse = await request(app)
        .put(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Updated Name',
        });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body).toHaveProperty('success', true);
      expect(updateResponse.body.data).toHaveProperty('name', 'Updated Name');
    });

    test('should allow DELETE /api/users/:id with valid token', async () => {
      // Create user first
      const createResponse = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Delete Test',
          email: 'delete.test@example.com',
        });

      const userId = createResponse.body.data.id;

      // Delete user
      const deleteResponse = await request(app)
        .delete(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body).toHaveProperty('success', true);
    });

    test('should reject POST /api/users without token', async () => {
      const response = await request(app).post('/api/users').send({
        name: 'Unauthorized User',
        email: 'unauth@example.com',
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
    });

    test('should reject PUT /api/users/:id without token', async () => {
      const response = await request(app)
        .put('/api/users/some-id')
        .send({
          name: 'Unauthorized Update',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
    });

    test('should reject DELETE /api/users/:id without token', async () => {
      const response = await request(app).delete('/api/users/some-id');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('Public Endpoints', () => {
    test('should allow GET /api/health without token', async () => {
      const response = await request(app).get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('status', 'ok');
    });

    test('should allow POST /api/auth/register without token', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'public@example.com',
        password: 'Password123',
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
    });

    test('should allow POST /api/auth/login without token', async () => {
      // Register first
      await request(app).post('/api/auth/register').send({
        email: 'public.login@example.com',
        password: 'Password123',
      });

      // Login
      const response = await request(app).post('/api/auth/login').send({
        email: 'public.login@example.com',
        password: 'Password123',
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });
  });
});
