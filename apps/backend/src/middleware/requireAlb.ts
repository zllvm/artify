import { NextFunction, Request, Response } from "express";

import config from "../config/environment.js";
import { logger } from "../utils/logger/logger.js";

/**
 * Middleware to restrict access to AWS Application Load Balancer health checks only.
 *
 * Validates a secret token passed via query parameter (?token=xxx).
 * This token should be configured in both:
 * 1. ALB target group health check path (e.g., /ping?token=secret-guid)
 * 2. Backend environment variable (HEALTH_CHECK_SECRET)
 */
export function requireAlb(req: Request, res: Response, next: NextFunction) {
  const providedToken = req.query.token as string | undefined;
  const expectedToken = config.healthCheckSecret;

  if (!expectedToken) {
    logger.warn("HEALTH_CHECK_SECRET not configured - allowing health check");
    return next();
  }

  if (providedToken && providedToken === expectedToken) {
    return next();
  }

  logger.warn("Unauthorized health check attempt", {
    hasToken: !!providedToken,
    path: req.path,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });

  return res.status(403).json({
    success: false,
    error: "Forbidden",
  });
}
