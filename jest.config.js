module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.ts$',
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/goldstackLocal/',
    '/distWeb/',
    '/distLambda/',
    '.d.ts',
  ],
  globals: {
    'ts-jest': {
      tsconfig: './linter.tsconfig.json',
    },
  },
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
};
