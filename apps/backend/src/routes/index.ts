import { Router } from "express";

import { requireAlb } from "../middleware/requireAlb.js";
import { requireAnyAuth } from "../middleware/requireAnyAuth.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { UserRepository } from "../repositories/userRepository.js";
import { ChatGptService } from "../services/chatGptService.js";
import JwtService from "../services/jwtService.js";
import { createAuthRouter } from "./auth.js";
import { createDiagRouter } from "./diagnostic.js";
import { createManifestRouter } from "./manifest.js";
import { createPaintingRouter } from "./paintings.js";
import { createPinterestRouter } from "./pinterest.js";
import { createShareRouter } from "./shares.js";

import type { PassportStatic } from "passport";

export const createRoutes = (
  passport: PassportStatic,
  openai: ChatGptService,
  userJwt: JwtService,
  serviceJwt: JwtService,
  userRepo: UserRepository
) => {
  const router = Router();
  const auth = requireAuth(userJwt, userRepo);
  const anyAuth = requireAnyAuth(userJwt, serviceJwt, userRepo);

  router.use("/diagnostic", createDiagRouter(auth, requireAlb));
  router.use("/auth", createAuthRouter(passport, auth, serviceJwt));
  router.use("/paintings", createPaintingRouter(auth, openai));
  router.use("/manifest", createManifestRouter(auth));
  // router.use("/facebook", facebookRoutes);
  router.use("/pinterest", createPinterestRouter(auth, userRepo));
  router.use("/shares", createShareRouter(auth, anyAuth));

  return router;
};
