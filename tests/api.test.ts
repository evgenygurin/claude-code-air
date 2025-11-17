import request from 'supertest';
import app from '../src/index';
import { container } from '../src/container';
import { User } from '../src/types';

describe('Root Endpoint', () => {
  test('should return welcome message', async () => {
    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toHaveProperty('message', 'Welcome to TypeScript REST API');
    expect(response.body.data).toHaveProperty('version', '1.0.0');
  });
});

describe('Health Check Endpoint', () => {
  test('should return health status', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('status', 'ok');
    expect(response.body.data).toHaveProperty('timestamp');
    expect(response.body.data).toHaveProperty('uptime');
  });
});

describe('Users API', () => {
  const userRepository = container.getUserRepository();
  let authToken: string;

  beforeEach(async () => {
    const users = userRepository.findAll();
    users.forEach((user: User) => userRepository.delete(user.id));

    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'testpass123',
      });

    authToken = registerResponse.body.data.token;
  });

  describe('GET /api/users', () => {
    test('should return 400 when no authorization header', async () => {
      const response = await request(app).get('/api/users');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    test('should return users array with valid token', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('should return all users with valid token', async () => {
      await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'User One', email: 'user1@example.com' });

      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('name');
      expect(response.body.data[0]).toHaveProperty('email');
    });

    test('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', 'Bearer invalid.token.here');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/users', () => {
    test('should return 400 when no authorization header', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({ name: 'Alice', email: 'alice@example.com' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    test('should create a new user with valid token', async () => {
      const userData = {
        name: 'Alice Smith',
        email: 'alice@example.com',
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('name', userData.name);
      expect(response.body.data).toHaveProperty('email', userData.email);
    });

    test('should return 400 when name is missing', async () => {
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: 'test@example.com',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    test('should return 400 when email is missing', async () => {
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test User',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    test('should return 400 when both fields are missing', async () => {
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/users/:id', () => {
    test('should return 400 when no authorization header', async () => {
      const response = await request(app).get('/api/users/anyid');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    test('should get user by id with valid token', async () => {
      const createResponse = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Get Test', email: 'gettest@example.com' });

      const userId = createResponse.body.data.id;

      const response = await request(app)
        .get(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id', userId);
      expect(response.body.data).toHaveProperty('name', 'Get Test');
    });

    test('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/users/nonexistent-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('PUT /api/users/:id', () => {
    test('should return 400 when no authorization header', async () => {
      const response = await request(app)
        .put('/api/users/anyid')
        .send({ name: 'New Name' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    test('should update user name with valid token', async () => {
      const createResponse = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Old Name', email: 'update@example.com' });

      const userId = createResponse.body.data.id;

      const response = await request(app)
        .put(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'New Name' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('name', 'New Name');
      expect(response.body.data).toHaveProperty('email', 'update@example.com');
    });

    test('should update user email with valid token', async () => {
      const createResponse = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Test User', email: 'old@example.com' });

      const userId = createResponse.body.data.id;

      const response = await request(app)
        .put(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ email: 'new@example.com' });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('email', 'new@example.com');
    });

    test('should update multiple fields with valid token', async () => {
      const createResponse = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Old', email: 'old@example.com' });

      const userId = createResponse.body.data.id;

      const response = await request(app)
        .put(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'New', email: 'new@example.com' });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('name', 'New');
      expect(response.body.data).toHaveProperty('email', 'new@example.com');
    });

    test('should return 404 when updating non-existent user', async () => {
      const response = await request(app)
        .put('/api/users/nonexistent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Test' });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('DELETE /api/users/:id', () => {
    test('should return 400 when no authorization header', async () => {
      const response = await request(app).delete('/api/users/anyid');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    test('should delete user with valid token and return 204', async () => {
      const createResponse = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Delete Test', email: 'delete@example.com' });

      const userId = createResponse.body.data.id;

      const deleteResponse = await request(app)
        .delete(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(deleteResponse.status).toBe(204);

      const getResponse = await request(app)
        .get(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse.status).toBe(404);
    });

    test('should return 404 when deleting non-existent user', async () => {
      const response = await request(app)
        .delete('/api/users/nonexistent-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
    });

    test('should return 401 with invalid token', async () => {
      const response = await request(app)
        .delete('/api/users/anyid')
        .set('Authorization', 'Bearer invalid.token.here');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
    });
  });
});
