import pino, { Logger, LoggerOptions } from "pino";

import config from "../../config/environment.js";
import { MaskOptions, sanitizeData } from "./mask.js";

const DEFAULT_SAFE_MESSAGE = "Safe log output";

export interface LogContext {
  userId?: string;
  paintingId?: string;
  action?: string;
  [key: string]: unknown;
}

export class AppLogger {
  private logger: Logger;

  constructor() {
    const options: LoggerOptions = {
      level: config.app.logLevel,
      transport: config.app.isProd
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

  safe<T extends object>(data: T, options?: MaskOptions): void {
    const sanitized = sanitizeData(data, options);
    this.logger.info({ sanitized }, options?.message ?? DEFAULT_SAFE_MESSAGE);
  }
}

export const logger = new AppLogger();
