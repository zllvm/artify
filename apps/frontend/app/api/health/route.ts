import { NextRequest, NextResponse } from "next/server";

/**
 * Health check endpoint for ALB target group.
 * Validates a secret token to ensure only ALB can access this endpoint.
 *
 * In production, the token is required and must match HEALTH_CHECK_SECRET.
 * In development (no HEALTH_CHECK_SECRET set), any request is allowed.
 */
export function GET(request: NextRequest) {
  const expectedToken = process.env.HEALTH_CHECK_SECRET;

  // If no secret is configured (local dev), allow access
  if (!expectedToken) {
    return NextResponse.json({ status: "ok" });
  }

  // Validate token from query parameter
  const searchParams = request.nextUrl.searchParams;
  const providedToken = searchParams.get("token");

  if (providedToken && providedToken === expectedToken) {
    return NextResponse.json({ status: "ok" });
  }

  // Unauthorized
  return NextResponse.json(
    { success: false, error: "Forbidden" },
    { status: 403 }
  );
}
