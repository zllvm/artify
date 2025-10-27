import { Router } from 'express';

import config from '../config/environment.js';
import { logger } from '../utils/logger.js';

import type { Request, Response } from "express";
const router = Router();

router.get("/", (req: Request, res: Response) => {
  try {
    logger.debug("Health check requested");

    // const [aiHealth, socialMediaHealth] = await Promise.all([
    //   AIService.healthCheck(),
    //   SocialMediaService.healthCheck(),
    // ]);

    const healthStatus = {
      status: "OK",
      env: config.env,
      timestamp: new Date().toISOString(),
      service: "Art Management API",
      version: "1.0.0",
      baseUrl: config.baseUrl,
      frontendUrl: config.frontendUrl,
      services: {
        // ai: aiHealth,
        // socialMedia: socialMediaHealth,
      },
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
    };

    res.json(healthStatus);
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

export default router;
