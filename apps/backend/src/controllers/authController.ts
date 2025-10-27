import { Request, Response } from "express";

import config from "../config/environment.js";

export const handleAuthCallback = (req: Request, res: Response) => {
  res.cookie("jwt", req.user?.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  res.redirect(config.frontendUrl);
};
