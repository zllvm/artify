// Root: eslint.config.js
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
    linterOptions: { reportUnusedDisableDirectives: true },
  },

  {
    files: ["**/*.js"],
    ...js.configs.recommended,
  },

  ...ts.configs.recommendedTypeChecked.map((cfg) => ({
    ...cfg,
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      ...cfg.languageOptions,
      parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
        project: [path.resolve(__dirname, "packages/shared/tsconfig.json")],
      },
      globals: { ...globals.es2022 },
    },
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
