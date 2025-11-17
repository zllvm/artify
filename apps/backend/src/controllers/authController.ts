import { Request, Response } from "express";

import config from "../config/environment.js";

export const handleAuthCallback = (req: Request, res: Response) => {
  res.cookie("jwt", req.user?.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: req.user?.tokenExpiresAt,
    sameSite: "lax",
    domain: config.app.domainName,
    path: "/",
  });

  res.redirect(config.app.frontendUrl);
};
