module.exports = {
  clearMocks: true,
  preset: "ts-jest",
  testEnvironment: "node",
  setupFilesAfterEnv: ["./tests/bootstrap.ts"],
  collectCoverageFrom: ["**/app/libs/**/*.{js,jsx,ts,tsx}"],
  moduleNameMapper: {
    "^~/(.*)$": "<rootDir>/app/$1",
  },
};
