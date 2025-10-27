import { importSPKI, jwtVerify } from "jose";
import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

if (!process.env.JWT_PUBLIC_KEY) {
  throw new Error("JWT_PUBLIC_KEY is not defined in environment variables");
}

const spki = Buffer.from(process.env.JWT_PUBLIC_KEY, "base64").toString(
  "utf-8"
);

const PUBLIC_KEY = await importSPKI(spki, "RS256");

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Read token from cookies
  const jwt = req.cookies.get("jwt")?.value;

  // If no token, redirect to login
  if (!jwt) {
    const loginUrl = new URL("/", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  console.log("Verifying JWT in middleware", PUBLIC_KEY);

  try {
    await jwtVerify(jwt, PUBLIC_KEY, {
      algorithms: ["RS256"],
    });
    return NextResponse.next();
  } catch (err) {
    console.error("JWT verification failed:", err);
    return NextResponse.redirect(new URL("/", req.url));
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/share/:path*",
    "/upload/:path*",
    "/gallery/:path*",
  ],
};
