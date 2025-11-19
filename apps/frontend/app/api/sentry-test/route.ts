import { NextResponse } from "next/server";

import { getUser } from "@/lib/dal";
import * as Sentry from "@sentry/nextjs";

export async function GET() {
  const user = await getUser();

  if (!user || user.role !== "admin") {
    return NextResponse.json(
      { error: "Unauthorized. Admin access required." },
      { status: 403 }
    );
  }

  // Test server-side Sentry
  Sentry.captureMessage("Server-side Sentry test", "info");

  return NextResponse.json({
    message: "Server-side Sentry test sent. Check your Sentry dashboard.",
  });
}
