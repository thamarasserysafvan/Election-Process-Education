/** @type {import('jest').Config} */
const nextJest = require('next/jest');

const createJestConfig = nextJest({ dir: './' });

const config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
};

module.exports = async () => {
  const jestConfig = await createJestConfig(config)();
  // Ensure setupFilesAfterEnv is preserved (next/jest may override it)
  jestConfig.setupFilesAfterEnv = ['<rootDir>/jest.setup.ts'];
  return jestConfig;
};
