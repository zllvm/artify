import { NextResponse } from "next/server";

import { decrypt } from "@/lib/session";

import type { NextRequest } from "next/server";

const publicRoutes = ["/login"];

export async function middleware(request: NextRequest) {
  const { pathname: path } = request.nextUrl;

  const isPublicRoute = publicRoutes.includes(path);

  const jwt = request.cookies.get("jwt")?.value;
  const session = await decrypt(jwt);

  if (!isPublicRoute && !session) {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }

  if (isPublicRoute && session?.userId) {
    return NextResponse.redirect(new URL("/", request.nextUrl));
  }

  const headers = new Headers(request.headers);
  headers.set("x-current-path", path);

  return NextResponse.next();
  // if (pathname !== "/") loginUrl.searchParams.set("redirect", pathname);
}

export const config = {
  matcher:
    "/((?!api|backend|_next/static|_next/image|images|favicons|icons|art|favicon\\.ico|logo\\.png).*)",
};
