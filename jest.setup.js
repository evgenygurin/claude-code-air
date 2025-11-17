/**
 * Jest global setup file
 * Configured for Node.js environment with test isolation
 */

// Increase timeout for integration tests
jest.setTimeout(10000);

// Optional: Suppress specific console output during tests
// Uncomment to silence console during test runs:
// global.console = {
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn(),
// };
