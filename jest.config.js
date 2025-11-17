/** @type {import('jest').Config} */
const config = {
  displayName: 'typescript-api',
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: [
    '<rootDir>/tests/**/*.test.ts',
    '<rootDir>/tests/**/*.spec.ts',
  ],
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.ts',
  ],
  testTimeout: 10000,
  verbose: true,
  bail: false,
  clearMocks: true,
  resetMocks: true,
};

module.exports = config;
