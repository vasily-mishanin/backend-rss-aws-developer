module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/test', '<rootDir>/resources'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
};
