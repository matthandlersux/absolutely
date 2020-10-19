module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  watchPathIgnorePatterns: ['test/fixtures/empty-testing-folder/*'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  moduleNameMapper: {
    '^@app/(.*)$': '<rootDir>/src/$1',
  },
};
