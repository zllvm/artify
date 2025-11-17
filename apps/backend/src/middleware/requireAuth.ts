import { NextFunction, Request, Response } from "express";

import config from "../config/environment.js";
import { UserRepository } from "../repositories/userRepository.js";
import JwtService from "../services/jwtService.js";
import { unauthorized } from "../utils/http.js";

import type { JwtPayload as BaseJwtPayload } from "jsonwebtoken";
export interface AppJwtPayload extends BaseJwtPayload {
  email: string;
  name: string;
  sub: string;
}

export function requireAuth(jwtService: JwtService, userRepo: UserRepository) {
  return (req: Request, res: Response, next: NextFunction) => {
    const cookies = req.cookies as Record<string, string> | undefined;
    const token = cookies?.jwt;
    if (!token) return unauthorized(res);

    try {
      const payload = jwtService.verifyJwt(token);

      if (
        !payload.sub ||
        !payload.iat ||
        !payload.iss ||
        !payload.exp ||
        !payload.sub ||
        !payload.jti
      ) {
        return unauthorized(res, "Invalid token payload");
      }

      const user = userRepo.get(payload.sub);

      if (!user) {
        res.clearCookie("jwt", {
          httpOnly: true,
          secure: true,
          sameSite: "lax",
          domain: config.app.domainName,
          path: "/",
        });
        return unauthorized(res, "User not found");
      }

      req.user = user;

      next();
    } catch {
      return unauthorized(res, "Invalid token");
    }
  };
}
