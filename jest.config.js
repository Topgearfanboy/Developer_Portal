/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  testEnvironment: "jsdom",
  transform: {
    "^.+\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "<rootDir>/tsconfig.test.json",
      },
    ],
  },
  transformIgnorePatterns: [
    "node_modules/(?!(@testing-library)/)"
  ],
  moduleNameMapper: {
    "^(.+\\.css)$": "identity-obj-proxy",
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/src/jest.setup.ts"],
  modulePathIgnorePatterns: [
    "<rootDir>/.next",
    "<rootDir>/coverage",
    "<rootDir>/playwright-report",
    "<rootDir>/test-results",
  ],
  testMatch: [
    "<rootDir>/src/**/*.test.ts",
    "<rootDir>/src/**/*.test.tsx",
    "<rootDir>/app/**/*.test.ts",
    "<rootDir>/app/**/*.test.tsx",
  ],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "app/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/jest.setup.ts",
    "!src/index.css",
    "!**/*.config.*",
    "!**/*.test.{ts,tsx}",
  ],
  coverageDirectory: "<rootDir>/coverage",
  coverageReporters: ["text", "html", "lcov"],
};
