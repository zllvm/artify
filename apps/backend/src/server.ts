import { Server } from "http";

import { createApp } from "./app.js";
import config from "./config/environment.js";
import { logger } from "./utils/logger.js";

const app = createApp();

const server: Server = app.listen(config.port, () => {
  logger.info(`Server running on port ${config.port}`, { env: config.env });
});

process.on("exit", (code) => logger.info("Process exit", { code }));

process.on("uncaughtException", (err: Error): void => {
  logger.error("Uncaught exception", err);
});

process.on("unhandledRejection", (reason: unknown) => {
  logger.error("Unhandled rejection", undefined, { reason });
});

process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully");
  server.close(() => {
    logger.info("HTTP server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  logger.info("SIGINT received, shutting down gracefully");
  server.close(() => {
    logger.info("HTTP server closed");
    process.exit(0);
  });
});
