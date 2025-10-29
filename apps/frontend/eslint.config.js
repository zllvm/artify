import base from "../../eslint.config.js";
import globals from "globals";
import parser from "@typescript-eslint/parser";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default [
  ...base,

  //
  // --- Frontend (client-side React code) ---
  //
  {
    files: [
      "src/**/*.{ts,tsx}",
      "app/**/*.{ts,tsx}",
      "components/**/*.{ts,tsx}",
    ],
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooks,
    },
    languageOptions: {
      parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
        project: [
          path.resolve(__dirname, "tsconfig.json"),
          path.resolve(__dirname, "../../packages/shared/tsconfig.json"),
        ],
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.es2022,
      },
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      // Warn on console in browser code, but allow warn/error
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },

  //
  // --- Next.js middleware / API routes (server-side) ---
  //
  {
    files: [
      "middleware.{ts,tsx,js,jsx}",
      "src/middleware.{ts,tsx,js,jsx}",
      "src/app/api/**/*.{ts,tsx,js,jsx}",
    ],
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
      // Turn off console restriction for server-side files
      "no-console": "off",
    },
  },
];
