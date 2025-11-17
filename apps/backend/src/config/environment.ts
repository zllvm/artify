import dotenv from "dotenv";
import fs from "fs";

import { sanitizeData } from "../utils/logger/mask.js";
import { appMaskRules } from "../utils/logger/maskRules.js";

import type { SignOptions } from "jsonwebtoken";

import type { Algorithm } from "jsonwebtoken";
if (fs.existsSync(".env")) {
  dotenv.config();
}

const allowedAlgorithms: Algorithm[] = ["RS256"];

export function createConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const baseUrl = env.BASE_URL || "http://localhost:3001";
  return Object.freeze({
    app: {
      baseUrl: baseUrl,
      frontendUrl: env.FRONTEND_URL ?? "",
      domainName: requireEnv(env, "DOMAIN_NAME"),
      port: env.PORT ? parseInt(env.PORT, 10) : 3001,
      env: env.NODE_ENV || "development",
      logLevel: env.LOG_LEVEL || "debug",
      version: env.APP_VERSION || "local",
      isProd: env.NODE_ENV === "production",
      adminEmails: (env.ADMIN_EMAILS ?? "")
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean),
    },

    jwt: {
      privateKey: Buffer.from(
        requireEnv(env, "JWT_PRIVATE_KEY"),
        "base64"
      ).toString("utf-8"),
      publicKey: Buffer.from(
        requireEnv(env, "JWT_PUBLIC_KEY"),
        "base64"
      ).toString("utf-8"),
      algorithm: resolveAlgorithm(env.JWT_ALGORITHM, "RS256"),
      expiresIn: getDuration(env.JWT_EXPIRES_IN, "1h"),
      audience: env.JWT_AUDIENCE || "artify-frontend",
      issuer: env.JWT_ISSUER || "artify-backend",
    },

    jwtService: {
      audience: env.JWT_SERVICE_AUDIENCE || "artify-internal",
      issuer: env.JWT_SERVICE_ISSUER || "artify-service-auth",
      expiresIn: getDuration(env.JWT_SERVICE_EXPIRES_IN, "5m"),
    },

    openai: {
      apiKey: env.OPENAI_API_KEY ?? "",
    },

    facebook: {
      appId: env.FB_APP_ID ?? "",
      appSecret: env.FB_APP_SECRET ?? "",
      redirectUri: env.FB_REDIRECT_URI ?? "",
    },

    google: {
      clientId: env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: env.GOOGLE_CLIENT_SECRET ?? "",
      redirectUri: joinUrl(baseUrl, env.GOOGLE_REDIRECT_URI),
    },

    pinterest: {
      url: env.PINTEREST_URL ?? "",
      tokenUrl: env.PINTEREST_TOKEN_URL ?? "",
      clientId: env.PINTEREST_CLIENT_ID ?? "",
      clientSecret: env.PINTEREST_CLIENT_SECRET ?? "",
      redirectUri: joinUrl(baseUrl, env.PINTEREST_REDIRECT_URI),
    },
  });
}

export function safeConfig(): Record<string, unknown> {
  const sanitized = sanitizeData(config, {
    rules: appMaskRules,
  });

  return sanitized;
}

// ---- Helpers ----

function requireEnv(env: NodeJS.ProcessEnv, name: string): string {
  const value = env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export function joinUrl(base: string, path = ""): string {
  if (!path) return base.replace(/\/$/, "");
  return `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

function resolveAlgorithm(
  value: string | undefined,
  defaultValue: string
): Algorithm {
  const algo = (value || defaultValue) as Algorithm;
  if (!allowedAlgorithms.includes(algo)) {
    throw new Error(`Invalid JWT_ALGORITHM: ${algo}`);
  }
  return algo;
}

function getDuration(
  value: string | undefined,
  defaultValue: SignOptions["expiresIn"] = "1h"
): SignOptions["expiresIn"] {
  if (!value) return defaultValue;
  const num = Number(value);
  return !isNaN(num) ? num : (value as SignOptions["expiresIn"]);
}

// ---- Types ----

export interface AppConfig {
  app: {
    baseUrl: string;
    frontendUrl: string;
    domainName: string;
    port: number;
    env: string;
    logLevel: string;
    version: string;
    isProd: boolean;
    adminEmails: string[];
  };
  jwt: {
    privateKey: string;
    publicKey: string;
    algorithm: Algorithm;
    expiresIn: SignOptions["expiresIn"];
    audience: string;
    issuer: string;
  };
  jwtService: {
    audience: string;
    issuer: string;
    expiresIn: SignOptions["expiresIn"];
  };
  openai: {
    apiKey: string;
  };
  facebook: {
    appId: string;
    appSecret: string;
    redirectUri: string;
  };
  google: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
  };
  pinterest: {
    url: string;
    tokenUrl: string;
    clientId: string;
    clientSecret: string;
    redirectUri: string;
  };
}

// ---- Default instance ----

const config = createConfig();
export default config;
