import { RequestHandler, Router } from "express";
import { z } from "zod";

import { ApiResponse, ApiToken, IUserDto } from "@artify/shared";

import config from "../config/environment.js";
import { handleAuthCallback } from "../controllers/authController.js";
import JwtService from "../services/jwtService.js";

import type { PassportStatic } from "passport";

const TokenRequestSchema = z.object({
  client_id: z.string().min(1, "client_id is required"),
  client_secret: z.string().min(1, "client_secret is required"),
});

export const createAuthRouter = (
  passport: PassportStatic,
  requireAuth: RequestHandler,
  serviceJwt: JwtService
) => {
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
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      domain: config.app.domainName,
      path: "/",
    });
    res.json({ success: true });
  });

  // s2s
  router.post("/token", (req, res) => {
    const parsed = TokenRequestSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ success: false, error: "Invalid request" });
    }

    const { client_id, client_secret } = parsed.data;

    if (
      client_id !== process.env.SERVICE_CLIENT_ID ||
      client_secret !== process.env.SERVICE_CLIENT_SECRET
    ) {
      return res.status(401).json({ error: "Invalid client credentials" });
    }

    const { token, expireAt } = serviceJwt.generateJwt({
      id: client_id,
    });

    const response: ApiResponse<ApiToken> = {
      success: true,
      data: { token, expireAt },
    };

    return res.json(response);
  });

  router.get("/me", requireAuth, (req, res) => {
    const user = req.user!;
    const response: IUserDto = {
      id: user.id,
      email: user.email,
      name: user.name,
      displayName: user.name,
      isAuthenticated: user.isAuthenticated,
      tokenExpiresAt: user.tokenExpiresAt?.toISOString(),
      isPinterestConnected: user.isPinterestConnected,
      role: user.role,
    };

    res.json(response);
  });

  return router;
};
