import base from "../../eslint.config.js";
import globals from "globals";
import parser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default [
  ...base,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
        project: [
          path.resolve(__dirname, "tsconfig.json"),
          path.resolve(__dirname, "../../packages/shared/tsconfig.json"),
        ],
      },
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
    },
    rules: {
      "no-console": "off",
    },
  },
];
