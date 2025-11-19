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

  // Test server-side Sentry with an error
  const error = new Error("Test error from server-side API");
  Sentry.captureException(error);

  return NextResponse.json({
    message: "Server-side error captured. Check your Sentry dashboard.",
    error: error.message,
  });
}
