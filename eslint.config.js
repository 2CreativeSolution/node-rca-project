module.exports = [
  {
    files: ["**/*.js"],
    ignores: ["node_modules/**", "coverage/**", "dist/**", "build/**"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: {
        console: "readonly",
        module: "readonly",
        process: "readonly",
        require: "readonly"
      }
    },
    rules: {
      "no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", caughtErrors: "all", caughtErrorsIgnorePattern: "^_" }
      ],
      "no-undef": "error"
    }
  },
  {
    files: ["backend/tests/**/*.js", "__mocks__/**/*.js"],
    languageOptions: {
      globals: {
        beforeEach: "readonly",
        describe: "readonly",
        expect: "readonly",
        jest: "readonly",
        test: "readonly"
      }
    },
    rules: {
      "no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", caughtErrors: "all", caughtErrorsIgnorePattern: "^_" }
      ],
      "no-undef": "error"
    }
  }
];
