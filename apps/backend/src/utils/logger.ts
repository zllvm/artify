import pino, { Logger, LoggerOptions } from "pino";

import config from "../config/environment.js";

export interface LogContext {
  userId?: string;
  paintingId?: string;
  action?: string;
  [key: string]: unknown;
}

class AppLogger {
  private logger: Logger;

  constructor() {
    const options: LoggerOptions = {
      level: config.logLevel,
      transport: config.isProd
        ? undefined // JSON logs for CloudWatch
        : {
            target: "pino-pretty",
            options: {
              colorize: true,
              translateTime: "SYS:standard",
              ignore: "pid,hostname",
            },
          },
    };

    this.logger = pino(options);
  }

  info(message: string, context?: LogContext): void {
    this.logger.info(context ?? {}, message);
  }

  warn(message: string, context?: LogContext): void {
    this.logger.warn(context ?? {}, message);
  }

  error(message: string, error?: Error, context?: LogContext): void {
    const errorContext = error
      ? { ...context, error: error.message, stack: error.stack }
      : context;
    this.logger.error(errorContext ?? {}, message);
  }

  debug(message: string, context?: LogContext): void {
    this.logger.debug(context ?? {}, message);
  }
}

export const logger = new AppLogger();
