module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/src/test/setup.js"],
  transform: { "^.+\\.[jt]sx?$": "babel-jest" },
  testMatch: ["<rootDir>/src/**/*.test.[jt]s?(x)"],
  moduleNameMapper: {
    "\\.(css|scss)$": "<rootDir>/src/test/styleMock.cjs",
    "\\.(png|jpg|jpeg|svg|webp|ico)$": "<rootDir>/src/test/fileMock.cjs",
  },
  clearMocks: true,
  collectCoverageFrom: [
    "src/Components/**/*.{js,jsx}",
    "src/hooks/**/*.{js,jsx}",
    "src/pages/**/*.{js,jsx}",
    "!src/**/*.test.{js,jsx}",
  ],
};
