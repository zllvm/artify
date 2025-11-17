import { NextFunction, Request, Response } from "express";

import JwtService from "../services/jwtService.js";
import { unauthorized } from "../utils/http.js";

export function requireServiceAuth(serviceJwt: JwtService) {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return unauthorized(res, "Missing or invalid Authorization header");
    }

    const token = authHeader.slice("Bearer ".length);

    try {
      const payload = serviceJwt.verifyJwt(token);

      if (!payload.sub || !payload.iat || !payload.exp) {
        return unauthorized(res, "Invalid token payload");
      }

      req.service = {
        id: payload.sub,
        issuer: payload.iss,
        audience: payload.aud,
        payload,
      };

      next();
    } catch {
      return unauthorized(res, "Invalid or expired service token");
    }
  };
}
