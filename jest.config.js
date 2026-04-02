module.exports = {
  testEnvironment: 'node',
  testTimeout: 15000,
  verbose: true,
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/utils/seed.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testMatch: ['**/test/**/*.test.js'],
  // For MongoDB integration tests, you might need to mock or use a test database
  // setupFilesAfterEnv: ['<rootDir>/test/setup.js']
};
