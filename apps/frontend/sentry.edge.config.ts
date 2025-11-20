import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
console.log("[Sentry Edge] DSN:", dsn ? "configured" : "missing");

Sentry.init({
  dsn,
  debug: process.env.NEXT_PUBLIC_SENTRY_DEBUG === "true",
  // Adds request headers and IP for users, for more info visit:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: true,
  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for tracing.
  // We recommend adjusting this value in production
  // Learn more at
  // https://docs.sentry.io/platforms/javascript/configuration/options/#traces-sample-rate
  tracesSampleRate: 0,
  tracePropagationTargets: [],
  // that it will also get attached to your source maps

  // Enable logs to be sent to Sentry
  enableLogs: true,
  integrations: [
    Sentry.consoleLoggingIntegration({ levels: ["warn", "error"] }),
  ],
});

console.log("[Sentry Edge] Initialized");
