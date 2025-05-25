module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverage: true,
  coverageReporters: ['text', 'lcov'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'services/**/*.js',
    'utils/**/*.js',
    '!**/node_modules/**',
    '!**/vendor/**'
  ],
  verbose: true,
  // Prevent tests from running in parallel to avoid MongoDB connection conflicts
  maxWorkers: 1,
  // Set timeout to handle async operations
  testTimeout: 10000
};