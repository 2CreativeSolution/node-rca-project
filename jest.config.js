module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/backend/tests"],
  clearMocks: true,
  setupFiles: ["<rootDir>/backend/tests/setupEnv.js"],
  collectCoverageFrom: ["backend/src/**/*.js"]
};
