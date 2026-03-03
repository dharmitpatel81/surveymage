module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['services/**/*.js', 'repositories/**/*.js'],
  coveragePathIgnorePatterns: ['/node_modules/']
};
