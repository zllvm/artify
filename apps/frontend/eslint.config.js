import ts from "typescript-eslint";
import globals from "globals";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import prettier from "eslint-config-prettier";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default [
  {
    ignores: [
      "**/dist/**",
      "**/.next/**",
      "**/out/**",
      "**/next-env.d.ts",
      "**/node_modules/**",
    ],
  },

  ...ts.configs.recommendedTypeChecked.map((cfg) => ({
    ...cfg,
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      ...cfg.languageOptions,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
  })),

  prettier,

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
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
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
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
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
