import { InMemoryUserRepository } from '../../src/repositories/InMemoryUserRepository';
import { User } from '../../src/types';

describe('InMemoryUserRepository', () => {
  let repository: InMemoryUserRepository;
  let testUser: User;

  beforeEach(() => {
    repository = new InMemoryUserRepository();
    testUser = {
      id: 'user1',
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword',
      createdAt: new Date(),
    };
  });

  describe('create', () => {
    test('should create and return user', () => {
      const result = repository.create(testUser);

      expect(result.id).toBe(testUser.id);
      expect(result.name).toBe(testUser.name);
      expect(result.email).toBe(testUser.email);
    });

    test('should store user in repository', () => {
      repository.create(testUser);

      const found = repository.findById(testUser.id);
      expect(found).toBeDefined();
      expect(found?.email).toBe(testUser.email);
    });

    test('should allow multiple users', () => {
      const user2 = { ...testUser, id: 'user2', email: 'user2@example.com' };

      repository.create(testUser);
      repository.create(user2);

      const all = repository.findAll();
      expect(all).toHaveLength(2);
    });
  });

  describe('findAll', () => {
    test('should return empty array when no users', () => {
      const result = repository.findAll();

      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });

    test('should return all users', () => {
      const user2 = { ...testUser, id: 'user2', email: 'user2@example.com' };

      repository.create(testUser);
      repository.create(user2);

      const result = repository.findAll();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('user1');
      expect(result[1].id).toBe('user2');
    });

    test('should return users in correct order', () => {
      const user1 = { ...testUser, id: 'id1' };
      const user2 = { ...testUser, id: 'id2' };
      const user3 = { ...testUser, id: 'id3' };

      repository.create(user1);
      repository.create(user2);
      repository.create(user3);

      const result = repository.findAll();

      expect(result.map((u) => u.id)).toEqual(['id1', 'id2', 'id3']);
    });
  });

  describe('findById', () => {
    test('should return undefined for non-existent user', () => {
      const result = repository.findById('nonexistent');

      expect(result).toBeUndefined();
    });

    test('should find user by id', () => {
      repository.create(testUser);

      const result = repository.findById(testUser.id);

      expect(result).toBeDefined();
      expect(result?.email).toBe(testUser.email);
    });

    test('should return correct user when multiple exist', () => {
      const user2 = { ...testUser, id: 'user2', email: 'user2@example.com' };

      repository.create(testUser);
      repository.create(user2);

      const result = repository.findById('user2');

      expect(result?.email).toBe('user2@example.com');
      expect(result?.id).toBe('user2');
    });
  });

  describe('findByEmail', () => {
    test('should return undefined for non-existent email', () => {
      const result = repository.findByEmail('nonexistent@example.com');

      expect(result).toBeUndefined();
    });

    test('should find user by email', () => {
      repository.create(testUser);

      const result = repository.findByEmail(testUser.email);

      expect(result).toBeDefined();
      expect(result?.id).toBe(testUser.id);
    });

    test('should return correct user when multiple exist', () => {
      const user2 = { ...testUser, id: 'user2', email: 'user2@example.com' };

      repository.create(testUser);
      repository.create(user2);

      const result = repository.findByEmail('user2@example.com');

      expect(result?.id).toBe('user2');
      expect(result?.email).toBe('user2@example.com');
    });

    test('should be case-sensitive', () => {
      repository.create(testUser);

      const result = repository.findByEmail('TEST@EXAMPLE.COM');

      expect(result).toBeUndefined();
    });
  });

  describe('update', () => {
    test('should return undefined for non-existent user', () => {
      const result = repository.update('nonexistent', { name: 'New Name' });

      expect(result).toBeUndefined();
    });

    test('should update user name', () => {
      repository.create(testUser);

      const result = repository.update(testUser.id, { name: 'Updated Name' });

      expect(result?.name).toBe('Updated Name');
      expect(result?.email).toBe(testUser.email);
    });

    test('should update user email', () => {
      repository.create(testUser);

      const result = repository.update(testUser.id, { email: 'newemail@example.com' });

      expect(result?.email).toBe('newemail@example.com');
      expect(result?.name).toBe(testUser.name);
    });

    test('should update multiple fields', () => {
      repository.create(testUser);

      const result = repository.update(testUser.id, {
        name: 'New Name',
        email: 'new@example.com',
      });

      expect(result?.name).toBe('New Name');
      expect(result?.email).toBe('new@example.com');
    });

    test('should persist updates', () => {
      repository.create(testUser);
      repository.update(testUser.id, { name: 'Updated' });

      const found = repository.findById(testUser.id);

      expect(found?.name).toBe('Updated');
    });

    test('should not affect other users', () => {
      const user2 = { ...testUser, id: 'user2', email: 'user2@example.com' };

      repository.create(testUser);
      repository.create(user2);
      repository.update(testUser.id, { name: 'Updated' });

      const found = repository.findById('user2');

      expect(found?.name).toBe('Test User');
    });
  });

  describe('delete', () => {
    test('should return false for non-existent user', () => {
      const result = repository.delete('nonexistent');

      expect(result).toBe(false);
    });

    test('should delete user', () => {
      repository.create(testUser);

      const result = repository.delete(testUser.id);

      expect(result).toBe(true);
    });

    test('should remove user from repository', () => {
      repository.create(testUser);

      repository.delete(testUser.id);

      const found = repository.findById(testUser.id);
      expect(found).toBeUndefined();
    });

    test('should not affect other users', () => {
      const user2 = { ...testUser, id: 'user2', email: 'user2@example.com' };

      repository.create(testUser);
      repository.create(user2);
      repository.delete(testUser.id);

      const found = repository.findById('user2');
      expect(found).toBeDefined();
    });

    test('should delete from all indices', () => {
      repository.create(testUser);

      repository.delete(testUser.id);

      const all = repository.findAll();
      const byId = repository.findById(testUser.id);
      const byEmail = repository.findByEmail(testUser.email);

      expect(all).toHaveLength(0);
      expect(byId).toBeUndefined();
      expect(byEmail).toBeUndefined();
    });
  });

  describe('exists', () => {
    test('should return false for non-existent user', () => {
      const result = repository.exists('nonexistent');

      expect(result).toBe(false);
    });

    test('should return true for existing user', () => {
      repository.create(testUser);

      const result = repository.exists(testUser.id);

      expect(result).toBe(true);
    });

    test('should return false after deletion', () => {
      repository.create(testUser);
      repository.delete(testUser.id);

      const result = repository.exists(testUser.id);

      expect(result).toBe(false);
    });
  });
});
