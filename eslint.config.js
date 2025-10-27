import js from "@eslint/js";
import ts from "typescript-eslint";
import prettier from "eslint-config-prettier";
import globals from "globals";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default [
  js.configs.recommended,
  ...ts.configs.recommendedTypeChecked,
  prettier,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: path.resolve(__dirname),
      },
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
    },
  },
  {
    ignores: ["**/dist/**", "node_modules/**"],
  },
];
