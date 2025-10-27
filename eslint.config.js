import js from "@eslint/js";
import ts from "typescript-eslint";
import prettier from "eslint-config-prettier";
import globals from "globals";
import parser from "@typescript-eslint/parser";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default [
  {
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
  },
  // JS configs
  {
    files: ["**/*.js", "*.js"],
    ...js.configs.recommended,
  },

  // TS configs — each element applies to .ts/.tsx files
  ...ts.configs.recommendedTypeChecked.map((cfg) => ({
    ...cfg,
    files: ["apps/backend/**/*.ts", "apps/backend/**/*.tsx"],
    languageOptions: {
      ...cfg.languageOptions,
      sourceType: "module",
      parser,
      parserOptions: {
        projectService: true,
        project: [
          path.resolve(__dirname, "apps/backend/tsconfig.json"),
          path.resolve(__dirname, "packages/shared/tsconfig.json"),
        ],
        tsconfigRootDir: __dirname,
      },
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
    },
  })),

  prettier,
  {
    ignores: ["**/dist/**", "node_modules/**", "apps/frontend/**", "tmp/**"],
  },
];
