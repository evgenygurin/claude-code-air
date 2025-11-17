/**
 * API Routes
 */

import { Router, Request, Response } from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  userExists,
  registerUser,
  loginUser,
} from './controllers';
import {
  ApiResponse,
  HealthCheckResponse,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
} from './types';

export const router = Router();

/**
 * Register new user
 */
router.post('/auth/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Missing required fields: name, email, password',
      };
      res.status(400).json(response);
      return;
    }

    const data: RegisterRequest = { name, email, password };
    const authResponse = await registerUser(data);

    const response: ApiResponse<AuthResponse> = {
      success: true,
      data: authResponse,
      message: 'User registered successfully',
    };
    res.status(201).json(response);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    const response: ApiResponse<null> = {
      success: false,
      error: errorMessage,
    };
    res.status(400).json(response);
  }
});

/**
 * Login user
 */
router.post('/auth/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Missing required fields: email, password',
      };
      res.status(400).json(response);
      return;
    }

    const data: LoginRequest = { email, password };
    const authResponse = await loginUser(data);

    const response: ApiResponse<AuthResponse> = {
      success: true,
      data: authResponse,
      message: 'Login successful',
    };
    res.json(response);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    const response: ApiResponse<null> = {
      success: false,
      error: errorMessage,
    };
    res.status(401).json(response);
  }
});

/**
 * Health check endpoint
 */
router.get('/health', (_req: Request, res: Response): void => {
  const response: ApiResponse<HealthCheckResponse> = {
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  };
  res.json(response);
});

/**
 * Get all users
 */
router.get('/users', (_req: Request, res: Response): void => {
  try {
    const users = getAllUsers();
    const response: ApiResponse<typeof users> = {
      success: true,
      data: users,
      message: `Retrieved ${users.length} users`,
    };
    res.json(response);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    const response: ApiResponse<null> = {
      success: false,
      error: errorMessage,
    };
    res.status(500).json(response);
  }
});

/**
 * Get user by ID
 */
router.get('/users/:id', (req: Request, res: Response): void => {
  try {
    const user = getUserById(req.params.id);

    if (!user) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'User not found',
      };
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse<typeof user> = {
      success: true,
      data: user,
    };
    res.json(response);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    const response: ApiResponse<null> = {
      success: false,
      error: errorMessage,
    };
    res.status(500).json(response);
  }
});

/**
 * Create new user
 */
router.post('/users', (req: Request, res: Response): void => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Missing required fields: name, email',
      };
      res.status(400).json(response);
      return;
    }

    const user = createUser({ name, email });
    const response: ApiResponse<typeof user> = {
      success: true,
      data: user,
      message: 'User created successfully',
    };
    res.status(201).json(response);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    const response: ApiResponse<null> = {
      success: false,
      error: errorMessage,
    };
    res.status(500).json(response);
  }
});

/**
 * Update user
 */
router.put('/users/:id', (req: Request, res: Response): void => {
  try {
    if (!userExists(req.params.id)) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'User not found',
      };
      res.status(404).json(response);
      return;
    }

    const user = updateUser(req.params.id, req.body);
    const response: ApiResponse<typeof user> = {
      success: true,
      data: user,
      message: 'User updated successfully',
    };
    res.json(response);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    const response: ApiResponse<null> = {
      success: false,
      error: errorMessage,
    };
    res.status(500).json(response);
  }
});

/**
 * Delete user
 */
router.delete('/users/:id', (req: Request, res: Response): void => {
  try {
    if (!userExists(req.params.id)) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'User not found',
      };
      res.status(404).json(response);
      return;
    }

    deleteUser(req.params.id);
    const response: ApiResponse<null> = {
      success: true,
      message: 'User deleted successfully',
    };
    res.json(response);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    const response: ApiResponse<null> = {
      success: false,
      error: errorMessage,
    };
    res.status(500).json(response);
  }
});
