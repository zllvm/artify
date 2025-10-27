import js from "@eslint/js";
import ts from "typescript-eslint";
import prettier from "eslint-config-prettier";
import globals from "globals";

export default [
  js.configs.recommended,
  ...ts.configs.recommendedTypeChecked,
  prettier,
  {
    files: ["apps/backend/**/*.ts"],
    languageOptions: {
      parserOptions: {
        project: "./apps/backend/tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.node, // replaces env.node: true
        ...globals.es2022, // gives modern syntax globals
      },
    },
  },
  {
    ignores: ["**/dist/**", "node_modules/**"],
  },
];
