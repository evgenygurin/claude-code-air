import { Router, Request, Response, NextFunction } from 'express';
import { container } from './container';
import { ResponseBuilder } from './utils/ResponseBuilder';
import { HealthCheckResponse } from './types';

const authService = container.getAuthService();
const userService = container.getUserService();

const router = Router();

const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

router.post(
  '/auth/register',
  asyncHandler(async (req: Request, res: Response) => {
    const authResponse = await authService.register(req.body);
    res.status(201).json(ResponseBuilder.success(authResponse, 'User registered successfully'));
  }),
);

router.post(
  '/auth/login',
  asyncHandler(async (req: Request, res: Response) => {
    const authResponse = await authService.login(req.body);
    res.json(ResponseBuilder.success(authResponse, 'Login successful'));
  }),
);

router.get('/health', (_req: Request, res: Response) => {
  const healthResponse: HealthCheckResponse = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };
  res.json(ResponseBuilder.success(healthResponse));
});

router.get('/users', (_req: Request, res: Response) => {
  const users = userService.getAllUsers();
  res.json(ResponseBuilder.success(users, `Retrieved ${users.length} users`));
});

router.get(
  '/users/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const user = userService.getUserById(req.params.id);
    res.json(ResponseBuilder.success(user));
  }),
);

router.post(
  '/users',
  asyncHandler(async (req: Request, res: Response) => {
    const user = userService.createUser(req.body);
    res.status(201).json(ResponseBuilder.success(user, 'User created successfully'));
  }),
);

router.put(
  '/users/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const user = userService.updateUser(req.params.id, req.body);
    res.json(ResponseBuilder.success(user, 'User updated successfully'));
  }),
);

router.delete(
  '/users/:id',
  asyncHandler(async (req: Request, res: Response) => {
    userService.deleteUser(req.params.id);
    res.json(ResponseBuilder.success(null, 'User deleted successfully'));
  }),
);

export { router };
