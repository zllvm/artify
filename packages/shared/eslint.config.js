import ts from "typescript-eslint";
import prettier from "eslint-config-prettier";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default [
  {
    linterOptions: { reportUnusedDisableDirectives: "warn" },
  },

  ...ts.configs.recommended.map((cfg) => ({
    ...cfg,
    files: ["**/*.ts"],
    languageOptions: {
      ...cfg.languageOptions,
      parserOptions: {
        ...cfg.languageOptions?.parserOptions,
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
    ignores: ["dist/**", "node_modules/**", "*.tsbuildinfo"],
  },
];
