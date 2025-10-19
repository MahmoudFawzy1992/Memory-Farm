module.exports = {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/'],
  testMatch: ['**/__tests__/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],
  collectCoverageFrom: [
    'services/**/*.js',
    'utils/**/*.js',
    'controllers/**/*.js',
    '!**/__tests__/**',
    '!**/node_modules/**'
  ],
  testTimeout: 10000,
  verbose: true
};