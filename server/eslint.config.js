const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
  js.configs.recommended,

  // Backend source files
  {
    files: ["**/*.js"],
    ignores: ["tests/**/*.js"],
    languageOptions: {
      globals: globals.node,
      sourceType: "commonjs",
      ecmaVersion: "latest",
    },
  },

  // Vitest tests
  {
    files: ["tests/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.vitest,
      },
    },
  },
];