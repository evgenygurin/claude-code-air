import { IdGenerator } from '../../src/utils/IdGenerator';
import { ResponseBuilder } from '../../src/utils/ResponseBuilder';

describe('Utils', () => {
  describe('IdGenerator', () => {
    test('should generate id with default prefix', () => {
      const id = IdGenerator.generate();

      expect(id).toBeTruthy();
      expect(typeof id).toBe('string');
      expect(id).toMatch(/^id_/);
      expect(id.split('_').length).toBe(3);
    });

    test('should generate id with custom prefix', () => {
      const id = IdGenerator.generate('user');

      expect(id).toBeTruthy();
      expect(id).toMatch(/^user_/);
      expect(id.split('_').length).toBe(3);
    });

    test('should generate unique ids', () => {
      const id1 = IdGenerator.generate('test');
      const id2 = IdGenerator.generate('test');

      expect(id1).not.toBe(id2);
    });

    test('should include timestamp in id', () => {
      const beforeTime = Date.now();
      const id = IdGenerator.generate('id');
      const afterTime = Date.now();

      // Extract timestamp from id (middle part between underscores)
      const parts = id.split('_');
      const timestamp = parseInt(parts[1], 10);

      expect(timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(timestamp).toBeLessThanOrEqual(afterTime);
    });

    test('should include random component in id', () => {
      const id1 = IdGenerator.generate('id');
      const id2 = IdGenerator.generate('id');

      // Extract random components
      const random1 = id1.split('_')[2];
      const random2 = id2.split('_')[2];

      expect(random1).not.toBe(random2);
      expect(random1.length).toBeGreaterThan(0);
      expect(random2.length).toBeGreaterThan(0);
    });

    test('should handle prefix with underscores', () => {
      const id = IdGenerator.generate('custom_prefix');

      expect(id).toContain('custom_prefix');
    });

    test('should handle empty string prefix', () => {
      const id = IdGenerator.generate('');

      expect(id).toBeTruthy();
      expect(id).toMatch(/^_/);
    });
  });

  describe('ResponseBuilder', () => {
    test('should build success response with data', () => {
      const data = { id: '1', name: 'Test' };
      const response = ResponseBuilder.success(data);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(data);
      expect(response.error).toBeUndefined();
    });

    test('should build success response with message', () => {
      const data = { id: '1' };
      const message = 'User created successfully';
      const response = ResponseBuilder.success(data, message);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(data);
      expect(response.message).toBe(message);
    });

    test('should build success response without data', () => {
      const response = ResponseBuilder.success();

      expect(response.success).toBe(true);
      expect(response.data).toBeUndefined();
    });

    test('should build success response with only message', () => {
      const message = 'Operation successful';
      const response = ResponseBuilder.success(undefined, message);

      expect(response.success).toBe(true);
      expect(response.message).toBe(message);
    });

    test('should build error response', () => {
      const errorMessage = 'Invalid input';
      const response = ResponseBuilder.error(errorMessage);

      expect(response.success).toBe(false);
      expect(response.error).toBe(errorMessage);
      expect(response.data).toBeUndefined();
    });

    test('should build error response with various messages', () => {
      const errors = [
        'User not found',
        'Email already exists',
        'Invalid password',
        'Internal server error',
      ];

      errors.forEach((error) => {
        const response = ResponseBuilder.error(error);
        expect(response.success).toBe(false);
        expect(response.error).toBe(error);
      });
    });

    test('should handle success with null data', () => {
      const response = ResponseBuilder.success(null);

      expect(response.success).toBe(true);
      expect(response.data).toBeNull();
    });

    test('should handle success with complex data structures', () => {
      const complexData = {
        user: { id: '1', name: 'Test' },
        tokens: { access: 'token1', refresh: 'token2' },
        metadata: { createdAt: new Date().toISOString() },
      };

      const response = ResponseBuilder.success(complexData);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(complexData);
    });
  });
});
