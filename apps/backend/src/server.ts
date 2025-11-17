import { Server } from "http";

import { createApp } from "./app.js";
import config from "./config/environment.js";
import { logger } from "./utils/logger/logger.js";
import { appMaskRules } from "./utils/logger/maskRules.js";
import RuntimeStats from "./utils/runtimeStats.js";

let isShuttingDown = false;

const shouldLogFullConfig = config.app.isProd
  ? process.env.LOG_FULL_CONFIG === "true"
  : true;

const app = createApp();

const server: Server = app.listen(config.app.port, () => {
  logger.info("Server started", {
    port: config.app.port,
    env: config.app.env,
    version: process.env.APP_VERSION,
    runtimeStats: RuntimeStats.collect(),
  });

  if (shouldLogFullConfig) {
    logger.safe(config, {
      message: "Loaded configuration (masked)",
      rules: appMaskRules,
    });
  }
});

function shutdown(signal: string) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info(`${signal} received, shutting down gracefully`, {
    runtimeStats: RuntimeStats.collect(),
  });
  server.close(() => {
    logger.info("HTTP server closed");
    process.exit(0);
  });
}

process.on("exit", (code) =>
  logger.info("Process exit", { code, runtimeStats: RuntimeStats.collect() })
);

process.on("uncaughtException", (err: Error): void => {
  logger.error("Uncaught exception", err);
});

process.on("unhandledRejection", (reason: unknown) => {
  logger.error("Unhandled rejection", undefined, { reason });
});

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
