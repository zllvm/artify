import { Router } from 'express';

import { ChatGptService } from '../services/chatGptService.js';
import { createAuthRouter } from './auth.js';
import facebookRoutes from './facebook.js';
import healthRoutes from './health.js';
import { createManifestRouter } from './manifest.js';
import paintingRoute from './painting.js';
import { createPaintingRouter } from './paintings.js';
import { createShareRouter } from './shares.js';

import type { PassportStatic } from "passport";

export const createRoutes = (
  passport: PassportStatic,
  openai: ChatGptService
) => {
  const router = Router();
  router.use("/health", healthRoutes);
  router.use("/auth", createAuthRouter(passport));
  router.use("/paintings", createPaintingRouter(openai));
  router.use("/manifest", createManifestRouter());
  router.use("/facebook", facebookRoutes);
  router.use("/painting", paintingRoute);
  router.use("/shares", createShareRouter());

  return router;
};
