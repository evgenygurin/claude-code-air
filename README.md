# TypeScript REST API

A modern, production-ready REST API built with TypeScript, Express.js, and comprehensive testing infrastructure.

## Features

- ✅ TypeScript strict mode enabled
- ✅ Express.js REST API
- ✅ Jest unit and integration tests
- ✅ ESLint + Prettier for code quality
- ✅ Comprehensive Makefile for all operations
- ✅ Hot-reload development mode
- ✅ Production-ready build

## Quick Start

### Installation

```bash
npm install
```

### Development

```bash
make dev
```

The server starts on `http://localhost:3000`

### Testing

```bash
# Run all tests
make test

# Watch mode
make test-watch

# Coverage report
make coverage
```

### Code Quality

```bash
# Lint code
make lint

# Fix linting issues
make lint-fix

# Format code
make format

# Check formatting
make format-check
```

### Production

```bash
# Build
make build

# Start
make start
```

## API Endpoints

### Health Check
- `GET /api/health` - Health check endpoint

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## Project Structure

```text
src/
├── index.ts          # Server entry point
├── controllers.ts    # Business logic
├── routes.ts         # API routes
└── types.ts          # TypeScript types

tests/
└── api.test.ts       # API tests

Makefile             # Convenient commands
```

## Development Commands

All available commands in the Makefile:

```bash
make help            # Show all available commands
make dev             # Start development server
make build           # Build for production
make start           # Start production server
make test            # Run tests
make test-watch      # Run tests in watch mode
make coverage        # Generate coverage report
make lint            # Lint code
make lint-fix        # Fix linting issues
make format          # Format code with Prettier
make format-check    # Check formatting
make clean           # Clean build artifacts
make install         # Install dependencies
```

## Technologies

- **Runtime**: Node.js
- **Language**: TypeScript 5
- **Framework**: Express.js 4
- **Testing**: Jest 29
- **Linting**: ESLint + @typescript-eslint
- **Formatting**: Prettier
- **HTTP Testing**: Supertest

## License

MIT
