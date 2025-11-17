/**
 * Controller functions for business logic
 */

import { User, CreateUserRequest, UpdateUserRequest } from './types';

// In-memory database for demo purposes
const users: Map<string, User> = new Map();

/**
 * Generate unique ID
 */
function generateId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get all users
 */
export function getAllUsers(): User[] {
  return Array.from(users.values());
}

/**
 * Get user by ID
 */
export function getUserById(id: string): User | undefined {
  return users.get(id);
}

/**
 * Create new user
 */
export function createUser(data: CreateUserRequest): User {
  const id = generateId();
  const user: User = {
    id,
    name: data.name,
    email: data.email,
    createdAt: new Date(),
  };

  users.set(id, user);
  return user;
}

/**
 * Update user
 */
export function updateUser(
  id: string,
  data: UpdateUserRequest,
): User | undefined {
  const user = users.get(id);
  if (!user) {
    return undefined;
  }

  if (data.name !== undefined) {
    user.name = data.name;
  }
  if (data.email !== undefined) {
    user.email = data.email;
  }

  users.set(id, user);
  return user;
}

/**
 * Delete user
 */
export function deleteUser(id: string): boolean {
  return users.delete(id);
}

/**
 * Check if user exists
 */
export function userExists(id: string): boolean {
  return users.has(id);
}
