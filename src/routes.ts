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
} from './controllers';
import {
  registerUser,
  authenticateUser,
  authMiddleware,
  refreshTokenHandler,
} from './auth';
import { ApiResponse, HealthCheckResponse } from './types';

export const router = Router();

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
 * Register endpoint
 */
router.post(
  '/auth/register',
  async (req: Request, res: Response): Promise<void> => {
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

      const result = await registerUser(email, password);

      if (!result.success) {
        const response: ApiResponse<null> = {
          success: false,
          error: result.message,
        };
        res.status(400).json(response);
        return;
      }

      const response: ApiResponse<null> = {
        success: true,
        message: result.message,
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
  },
);

/**
 * Login endpoint
 */
router.post(
  '/auth/login',
  async (req: Request, res: Response): Promise<void> => {
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

      const result = await authenticateUser(email, password);

      if (!result.success) {
        const response: ApiResponse<null> = {
          success: false,
          error: result.message,
        };
        res.status(401).json(response);
        return;
      }

      const responseData = {
        token: result.token || '',
        refreshToken: result.refreshToken || '',
      };
      const response: ApiResponse<typeof responseData> = {
        success: true,
        data: responseData,
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
      res.status(500).json(response);
    }
  },
);

/**
 * Refresh token endpoint
 */
router.post(
  '/auth/refresh',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Missing refresh token',
        };
        res.status(400).json(response);
        return;
      }

      const result = await refreshTokenHandler(refreshToken);

      if (!result.success) {
        const response: ApiResponse<null> = {
          success: false,
          error: result.message,
        };
        res.status(401).json(response);
        return;
      }

      const responseData = { token: result.token || '' };
      const response: ApiResponse<typeof responseData> = {
        success: true,
        data: responseData,
        message: 'Token refreshed successfully',
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
  },
);

/**
 * Get all users (protected)
 */
router.get('/users', authMiddleware, (_req: Request, res: Response): void => {
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
 * Get user by ID (protected)
 */
router.get(
  '/users/:id',
  authMiddleware,
  (req: Request, res: Response): void => {
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
  },
);

/**
 * Create new user (protected)
 */
router.post('/users', authMiddleware, (req: Request, res: Response): void => {
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
 * Update user (protected)
 */
router.put(
  '/users/:id',
  authMiddleware,
  (req: Request, res: Response): void => {
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
  },
);

/**
 * Delete user (protected)
 */
router.delete(
  '/users/:id',
  authMiddleware,
  (req: Request, res: Response): void => {
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
  },
);
