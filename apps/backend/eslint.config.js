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

  ...ts.configs.recommendedTypeChecked.map((cfg) => ({
    ...cfg,
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ...cfg.languageOptions,
      parserOptions: {
        ...cfg.languageOptions?.parserOptions,
        project: "./tsconfig.json",
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
    files: ["**/*.{ts,tsx}"],
    rules: {
      "no-console": "off",
    },
  },

  {
    ignores: ["dist/**", "node_modules/**"],
  },
];
