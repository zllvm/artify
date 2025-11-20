import * as Sentry from "@sentry/nextjs";

export async function register() {
  console.log("[Instrumentation] Runtime:", process.env.NEXT_RUNTIME);

  if (process.env.NEXT_RUNTIME === "nodejs") {
    console.log("[Instrumentation] Loading server config");
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    console.log("[Instrumentation] Loading edge config");
    await import("./sentry.edge.config");
  }
}

export const onRequestError = Sentry.captureRequestError;
