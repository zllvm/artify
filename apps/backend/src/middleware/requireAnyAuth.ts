import { NextFunction, Request, Response } from "express";

import { UserRepository } from "../repositories/userRepository.js";
import JwtService from "../services/jwtService.js";
import { unauthorized } from "../utils/http.js";
import { requireAuth } from "./requireAuth.js";
import { requireServiceAuth } from "./requireServiceAuth.js";

export function requireAnyAuth(
  userJwt: JwtService,
  serviceJwt: JwtService,
  userRepo: UserRepository
) {
  const userAuth = requireAuth(userJwt, userRepo);
  const serviceAuth = requireServiceAuth(serviceJwt);

  return (req: Request, res: Response, next: NextFunction) => {
    const hasCookie = Boolean(req.cookies?.jwt);
    const hasAuthHeader = req.get("authorization")?.startsWith("Bearer ");

    if (hasCookie) return userAuth(req, res, next);
    if (hasAuthHeader) return serviceAuth(req, res, next);

    return unauthorized(res);
  };
}
