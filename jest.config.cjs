module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/tests/**/*.test.ts',
  ],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'backend/**/*.js',
    'backend/**/*.ts',
    '!backend/**/node_modules/**',
    '!backend/**/public/**',
    '!backend/**/uploads/**',
    '!backend/**/views/**',
    '!backend/**/scripts/**',
    '!backend/**/coverage/**',
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
};
