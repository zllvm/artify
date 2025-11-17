import "server-only";

import { importSPKI, JWTPayload, jwtVerify } from "jose";

import { SessionPayload } from "@/lib/definitions";
import { epochSecondsToDate } from "@/utils/dateUtils";

const JWT_ALGORITHM = "RS256";
let publicKeyCache: Awaited<ReturnType<typeof importSPKI>> | null = null;

async function getPublicKey() {
  if (publicKeyCache) return publicKeyCache;

  if (!process.env.JWT_PUBLIC_KEY) {
    throw new Error("JWT_PUBLIC_KEY is not defined in environment variables");
  }

  const spki = Buffer.from(process.env.JWT_PUBLIC_KEY, "base64").toString(
    "utf-8"
  );

  publicKeyCache = await importSPKI(spki, JWT_ALGORITHM);
  return publicKeyCache;
}

export async function decrypt(
  session: string | undefined = ""
): Promise<SessionPayload | null> {
  try {
    if (!session) return null;

    const publicKey = await getPublicKey();
    const { payload } = await jwtVerify<JWTPayload>(session, publicKey, {
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
