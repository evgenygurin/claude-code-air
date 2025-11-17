import request from 'supertest';
import app from '../src/index';
import { container } from '../src/container';
import { User } from '../src/types';

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

  beforeEach(() => {
    const users = userRepository.findAll();
    users.forEach((user: User) => userRepository.delete(user.id));
  });

  describe('GET /api/users', () => {
    test('should return empty array when no users exist', async () => {
      const response = await request(app).get('/api/users');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toEqual([]);
    });

    test('should return all users', async () => {
      await request(app)
        .post('/api/users')
        .send({ name: 'John Doe', email: 'john@example.com' });
      await request(app)
        .post('/api/users')
        .send({ name: 'Jane Doe', email: 'jane@example.com' });

      const response = await request(app).get('/api/users');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toHaveProperty('name');
      expect(response.body.data[0]).toHaveProperty('email');
    });
  });

  describe('POST /api/users', () => {
    test('should create a new user', async () => {
      const userData = {
        name: 'Alice Smith',
        email: 'alice@example.com',
      };

      const response = await request(app).post('/api/users').send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('name', userData.name);
      expect(response.body.data).toHaveProperty('email', userData.email);
    });

    test('should return 400 when name is missing', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          email: 'test@example.com',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Missing required fields');
    });

    test('should return 400 when email is missing', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          name: 'Test User',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    test('should return 400 when both fields are missing', async () => {
      const response = await request(app).post('/api/users').send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/users/:id', () => {
    test('should get user by id', async () => {
      const createResponse = await request(app)
        .post('/api/users')
        .send({ name: 'Get Test', email: 'gettest@example.com' });

      const userId = createResponse.body.data.id;

      const response = await request(app).get(`/api/users/${userId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id', userId);
      expect(response.body.data).toHaveProperty('name', 'Get Test');
    });

    test('should return 404 for non-existent user', async () => {
      const response = await request(app).get('/api/users/nonexistent-id');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('PUT /api/users/:id', () => {
    test('should update user name', async () => {
      const createResponse = await request(app)
        .post('/api/users')
        .send({ name: 'Old Name', email: 'update@example.com' });

      const userId = createResponse.body.data.id;

      const response = await request(app)
        .put(`/api/users/${userId}`)
        .send({ name: 'New Name' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('name', 'New Name');
      expect(response.body.data).toHaveProperty('email', 'update@example.com');
    });

    test('should update user email', async () => {
      const createResponse = await request(app)
        .post('/api/users')
        .send({ name: 'Test User', email: 'old@example.com' });

      const userId = createResponse.body.data.id;

      const response = await request(app)
        .put(`/api/users/${userId}`)
        .send({ email: 'new@example.com' });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('email', 'new@example.com');
    });

    test('should update multiple fields', async () => {
      const createResponse = await request(app)
        .post('/api/users')
        .send({ name: 'Old', email: 'old@example.com' });

      const userId = createResponse.body.data.id;

      const response = await request(app)
        .put(`/api/users/${userId}`)
        .send({ name: 'New', email: 'new@example.com' });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('name', 'New');
      expect(response.body.data).toHaveProperty('email', 'new@example.com');
    });

    test('should return 404 when updating non-existent user', async () => {
      const response = await request(app)
        .put('/api/users/nonexistent-id')
        .send({ name: 'Test' });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('DELETE /api/users/:id', () => {
    test('should delete user', async () => {
      const createResponse = await request(app)
        .post('/api/users')
        .send({ name: 'Delete Test', email: 'delete@example.com' });

      const userId = createResponse.body.data.id;

      const deleteResponse = await request(app).delete(`/api/users/${userId}`);

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body).toHaveProperty('success', true);

      const getResponse = await request(app).get(`/api/users/${userId}`);
      expect(getResponse.status).toBe(404);
    });

    test('should return 404 when deleting non-existent user', async () => {
      const response = await request(app).delete('/api/users/nonexistent-id');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('Root Endpoint', () => {
    test('should return API documentation', async () => {
      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('message');
      expect(response.body.data).toHaveProperty('version');
      expect(response.body.data).toHaveProperty('endpoints');
    });
  });
});
