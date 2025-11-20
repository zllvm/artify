import { Router } from "express";

import { safeConfig } from "../config/environment.js";
import { logger } from "../utils/logger/logger.js";
import RuntimeStats from "../utils/runtimeStats.js";

import type { ApiResponse } from "@artify/shared";
import type { Request, Response, RequestHandler } from "express";
export const createDiagRouter = (
  requireAuth: RequestHandler,
  requireAlb: RequestHandler
) => {
  const router = Router();

  router.get("/ping", requireAlb, (req: Request, res: Response) => {
    res.json({ message: "pong" });
  });

  router.get("/health", requireAuth, (req: Request, res: Response) => {
    try {
      const user = req.user;

      if (!user || !user.isAdmin) {
        return res.status(401).send("Unauthorized");
      }

      logger.info("Health check requested");

      // const [aiHealth, socialMediaHealth] = await Promise.all([
      //   AIService.healthCheck(),
      //   SocialMediaService.healthCheck(),
      // ]);

      const healthStatus = {
        status: "OK",
        runtime: RuntimeStats.collect(),
        config: safeConfig(),
        services: {
          // ai: aiHealth,
          // socialMedia: socialMediaHealth,
        },
      };

      return res.json({
        success: true,
        data: healthStatus,
      } as ApiResponse<Record<string, unknown>>);
    } catch (error) {
      logger.error("Health check failed", error as Error);
      res.status(500).json({
        status: "ERROR",
        timestamp: new Date().toISOString(),
        service: "Art Management API",
        error: "Health check failed",
      });
    }
  });

  router.get("/me", requireAuth, (req, res) => {
    const user = req.user;

    if (!user || !user.isAdmin) {
      return res.status(401).send("Unauthorized");
    }

    return res.json({
      success: true,
      data: user,
    } as ApiResponse<unknown>);
  });

  return router;
};
