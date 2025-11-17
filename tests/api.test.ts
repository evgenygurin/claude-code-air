/**
 * API Tests using Jest and Supertest
 */

import request from 'supertest';
import app from '../src/index';
import {
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
} from '../src/controllers';

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
  beforeEach(() => {
    // Clear users before each test
    const users = getAllUsers();
    users.forEach((user) => deleteUser(user.id));
  });

  describe('GET /api/users', () => {
    test('should return empty array when no users exist', async () => {
      const response = await request(app).get('/api/users');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toEqual([]);
    });

    test('should return all users', async () => {
      // Create test users
      createUser({ name: 'John Doe', email: 'john@example.com' });
      createUser({ name: 'Jane Doe', email: 'jane@example.com' });

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

      const response = await request(app)
        .post('/api/users')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('name', userData.name);
      expect(response.body.data).toHaveProperty('email', userData.email);
      expect(response.body.data).toHaveProperty('createdAt');
    });

    test('should return 400 when name is missing', async () => {
      const response = await request(app).post('/api/users').send({
        email: 'test@example.com',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Missing required fields');
    });

    test('should return 400 when email is missing', async () => {
      const response = await request(app).post('/api/users').send({
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
    test('should return user by ID', async () => {
      const user = createUser({ name: 'Bob Johnson', email: 'bob@example.com' });

      const response = await request(app).get(`/api/users/${user.id}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id', user.id);
      expect(response.body.data).toHaveProperty('name', user.name);
      expect(response.body.data).toHaveProperty('email', user.email);
    });

    test('should return 404 when user does not exist', async () => {
      const response = await request(app).get('/api/users/nonexistent_id');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'User not found');
    });
  });

  describe('PUT /api/users/:id', () => {
    test('should update user name', async () => {
      const user = createUser({
        name: 'Original Name',
        email: 'original@example.com',
      });

      const response = await request(app).put(`/api/users/${user.id}`).send({
        name: 'Updated Name',
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('name', 'Updated Name');
      expect(response.body.data).toHaveProperty('email', 'original@example.com');
    });

    test('should update user email', async () => {
      const user = createUser({
        name: 'John',
        email: 'original@example.com',
      });

      const response = await request(app).put(`/api/users/${user.id}`).send({
        email: 'updated@example.com',
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('name', 'John');
      expect(response.body.data).toHaveProperty('email', 'updated@example.com');
    });

    test('should update both name and email', async () => {
      const user = createUser({
        name: 'John',
        email: 'john@example.com',
      });

      const response = await request(app).put(`/api/users/${user.id}`).send({
        name: 'Jane',
        email: 'jane@example.com',
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('name', 'Jane');
      expect(response.body.data).toHaveProperty('email', 'jane@example.com');
    });

    test('should return 404 when user does not exist', async () => {
      const response = await request(app)
        .put('/api/users/nonexistent_id')
        .send({
          name: 'New Name',
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'User not found');
    });
  });

  describe('DELETE /api/users/:id', () => {
    test('should delete user', async () => {
      const user = createUser({ name: 'To Delete', email: 'delete@example.com' });

      const response = await request(app).delete(`/api/users/${user.id}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);

      // Verify user is deleted
      const getResponse = await request(app).get(`/api/users/${user.id}`);
      expect(getResponse.status).toBe(404);
    });

    test('should return 404 when user does not exist', async () => {
      const response = await request(app).delete('/api/users/nonexistent_id');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'User not found');
    });
  });

  describe('Integration Tests', () => {
    test('should handle complete user lifecycle', async () => {
      // Create user
      const createResponse = await request(app).post('/api/users').send({
        name: 'Lifecycle Test',
        email: 'lifecycle@example.com',
      });
      const userId = createResponse.body.data.id;

      // Verify creation
      expect(createResponse.status).toBe(201);
      expect(createResponse.body.data).toHaveProperty('id', userId);

      // Get user
      const getResponse = await request(app).get(`/api/users/${userId}`);
      expect(getResponse.status).toBe(200);
      expect(getResponse.body.data).toHaveProperty('name', 'Lifecycle Test');

      // Update user
      const updateResponse = await request(app).put(`/api/users/${userId}`).send({
        name: 'Updated Lifecycle Test',
      });
      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.data).toHaveProperty('name', 'Updated Lifecycle Test');

      // Delete user
      const deleteResponse = await request(app).delete(`/api/users/${userId}`);
      expect(deleteResponse.status).toBe(200);

      // Verify deletion
      const notFoundResponse = await request(app).get(`/api/users/${userId}`);
      expect(notFoundResponse.status).toBe(404);
    });

    test('should handle multiple users', async () => {
      const users = [
        { name: 'User 1', email: 'user1@example.com' },
        { name: 'User 2', email: 'user2@example.com' },
        { name: 'User 3', email: 'user3@example.com' },
      ];

      // Create multiple users
      for (const userData of users) {
        const response = await request(app).post('/api/users').send(userData);
        expect(response.status).toBe(201);
      }

      // Get all users
      const listResponse = await request(app).get('/api/users');
      expect(listResponse.status).toBe(200);
      expect(listResponse.body.data).toHaveLength(3);
    });
  });
});

describe('Root Endpoint', () => {
  test('should return welcome message', async () => {
    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('version', '1.0.0');
    expect(response.body).toHaveProperty('endpoints');
  });
});

describe('404 Handler', () => {
  test('should return 404 for unknown routes', async () => {
    const response = await request(app).get('/api/unknown-route');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('error', 'Not Found');
  });
});
