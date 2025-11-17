/* eslint-disable @typescript-eslint/no-empty-object-type */
import "express";

import type { AUser } from "../models/user.ts";
import type { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface User extends AUser {}
  }
}

declare module "express" {
  interface Request {
    cookies?: Record<string, string>;
    userId?: string;
    service?: {
      id: string;
      issuer?: string;
      audience?: string | string[];
      payload?: JwtPayload;
    };
  }
}
/* eslint-enable @typescript-eslint/no-empty-object-type */
