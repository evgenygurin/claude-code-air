import express, { Express } from 'express';
import { config } from './config';
import { router } from './routes';
import { logger } from './middleware/logger';
import { setupErrorHandler } from './middleware/errorHandler';
import { ResponseBuilder } from './utils/ResponseBuilder';
import {
  helmetConfig,
  corsMiddleware,
  customSecurityHeaders,
  hstsMiddleware,
  clickjackProtection,
} from './middleware/securityHeaders';
import { apiLimiter } from './middleware/rateLimitMiddleware';

const app: Express = express();
const { port } = config.app;

// Security middleware - should be before routes
app.use(helmetConfig);
app.use(customSecurityHeaders);
app.use(hstsMiddleware);
app.use(clickjackProtection);
app.use(corsMiddleware);

// Body parsing middleware
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Rate limiting - apply to all API routes
app.use('/api', apiLimiter);

// Request logging
app.use(logger);

app.get('/', (_req, res) => {
  res.json(
    ResponseBuilder.success({
      message: 'Welcome to TypeScript REST API',
      version: '1.0.0',
      endpoints: {
        auth: {
          register: 'POST /api/auth/register',
          login: 'POST /api/auth/login',
        },
        health: 'GET /api/health',
        users: {
          list: 'GET /api/users',
          get: 'GET /api/users/:id',
          create: 'POST /api/users',
          update: 'PUT /api/users/:id',
          delete: 'DELETE /api/users/:id',
        },
      },
    }),
  );
});

app.use('/api', router);

app.use((_req, res) => {
  res.status(404).json(ResponseBuilder.error('Not Found'));
});

setupErrorHandler(app);

if (require.main === module) {
  const server = app.listen(port, () => {
    console.log(`✅ Server running on http://localhost:${port}`);
    console.log(`📚 API Documentation:`);
    console.log(`   GET  http://localhost:${port}/api/health`);
    console.log(`   GET  http://localhost:${port}/api/users`);
    console.log(`   POST http://localhost:${port}/api/users`);
    console.log(`   POST http://localhost:${port}/api/auth/register`);
    console.log(`   POST http://localhost:${port}/api/auth/login`);
  });

  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully...');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
}

export default app;
