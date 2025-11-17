/**
 * Controller functions for business logic
 */

import {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  RegisterRequest,
  LoginRequest,
  AuthResponse,
} from './types';
import {
  hashPassword,
  comparePassword,
  generateToken,
  generateRefreshToken,
} from './auth';

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

/**
 * Find user by email
 */
export function getUserByEmail(email: string): User | undefined {
  for (const user of users.values()) {
    if (user.email === email) {
      return user;
    }
  }
  return undefined;
}

/**
 * Register new user with authentication
 */
export async function registerUser(
  data: RegisterRequest,
): Promise<AuthResponse> {
  const existingUser = getUserByEmail(data.email);
  if (existingUser) {
    throw new Error('Email already registered');
  }

  const id = generateId();
  const hashedPassword = await hashPassword(data.password);

  const user: User = {
    id,
    name: data.name,
    email: data.email,
    password: hashedPassword,
    createdAt: new Date(),
  };

  users.set(id, user);

  const { token } = generateToken(id, data.email);
  const { refreshToken } = generateRefreshToken(id, data.email);

  return {
    token,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  };
}

/**
 * Login user and return tokens
 */
export async function loginUser(
  data: LoginRequest,
): Promise<AuthResponse> {
  const user = getUserByEmail(data.email);

  if (!user || !user.password) {
    throw new Error('Invalid email or password');
  }

  const passwordMatch = await comparePassword(data.password, user.password);
  if (!passwordMatch) {
    throw new Error('Invalid email or password');
  }

  const { token } = generateToken(user.id, user.email);
  const { refreshToken } = generateRefreshToken(user.id, user.email);

  return {
    token,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  };
}
