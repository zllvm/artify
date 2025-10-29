import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import type { JwtPayload as BaseJwtPayload } from "jsonwebtoken";

export interface AppJwtPayload extends BaseJwtPayload {
  email: string;
  name: string;
  sub: string;
}

export function requireAuth(secret: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const cookies = req.cookies as Record<string, string> | undefined;
    const token = cookies?.jwt;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    try {
      const payload = jwt.verify(token, secret) as AppJwtPayload;

      if (!payload.sub || !payload.email || !payload.name) {
        return res.status(401).json({ error: "Invalid token payload" });
      }

      req.user = {
        id: payload.sub,
        email: payload.email,
        displayName: payload.name,
      };

      next();
    } catch {
      return res.status(401).json({ error: "Invalid token" });
    }
  };
}
