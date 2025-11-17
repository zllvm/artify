import "server-only";

import { importSPKI, jwtVerify } from "jose";

import { SessionPayload } from "@/lib/definitions";
import { epochSecondsToDate } from "@/utils/dateUtils";

import type { JwtPayload } from "jsonwebtoken";
if (!process.env.JWT_PUBLIC_KEY) {
  throw new Error("JWT_PUBLIC_KEY is not defined in environment variables");
}

const spki = Buffer.from(process.env.JWT_PUBLIC_KEY, "base64").toString(
  "utf-8"
);

const JWT_ALGORITHM = "RS256";
const publicKey = await importSPKI(spki, JWT_ALGORITHM);

export async function decrypt(
  session: string | undefined = ""
): Promise<SessionPayload | null> {
  try {
    if (!session) return null;

    const { payload } = await jwtVerify<JwtPayload>(session, publicKey, {
      algorithms: [JWT_ALGORITHM],
    });

    const sessionPayload = {
      userId: payload.sub,
      issueAt: epochSecondsToDate(payload.iat),
      expireAt: epochSecondsToDate(payload.exp),
      isAuthenticated: true,
    } as SessionPayload;

    return sessionPayload;
  } catch (err: unknown) {
    if (typeof err === "object" && err !== null && "code" in err) {
      const code = (err as { code?: string }).code;
      if (code !== "ERR_JWT_EXPIRED") {
        console.error("JWT verification error:", err);
      }
    } else {
      console.error("JWT verification unknown error:", err);
    }

    return null;
  }
}
