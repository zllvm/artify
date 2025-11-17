// Root: eslint.config.js
import js from "@eslint/js";
import ts from "typescript-eslint";
import prettier from "eslint-config-prettier";
import globals from "globals";

export default [
  {
    linterOptions: { reportUnusedDisableDirectives: true },
  },

  {
    files: ["**/*.js"],
    ...js.configs.recommended,
    languageOptions: {
      globals: { ...globals.node, ...globals.es2022 },
    },
  },

  ...ts.configs.recommended.map((cfg) => ({
    ...cfg,
    files: ["**/*.ts", "**/*.tsx"],
  })),

  prettier,

  {
    ignores: [
      "**/dist/**",
      "**/.next/**",
      "**/out/**",
      "**/next-env.d.ts",
      "**/node_modules/**",
      "tmp/**",
    ],
  },
];
