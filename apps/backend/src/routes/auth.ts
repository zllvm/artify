import { RequestHandler, Router } from 'express';

import config from '../config/environment.js';
import { handleAuthCallback } from '../controllers/authController.js';
import { requireAuth } from '../middleware/requireAuth.js';

import type { PassportStatic } from "passport";
export const createAuthRouter = (passport: PassportStatic) => {
  const router = Router();

  router.get(
    "/google",
    passport.authenticate("google", {
      scope: ["profile", "email"],
    }) as RequestHandler
  );

  router.get(
    "/google/callback",
    passport.authenticate("google", {
      session: false,
      failureRedirect: "/",
    }) as RequestHandler,
    handleAuthCallback
  );
  router.post("/logout", (req, res) => {
    res.clearCookie("jwt");
    res.json({ success: true });
  });

  router.get("/me", requireAuth(config.jwtPublicKey), (req, res) => {
    res.json(req.user);
  });

  return router;
};
