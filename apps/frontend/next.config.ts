import type { NextConfig } from "next/types";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

import { withSentryConfig } from "@sentry/nextjs";

import { BACKEND_URL } from "./app/config";

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: [],
};

export default withSentryConfig(
  (phase: string) => {
    const isDev = phase === PHASE_DEVELOPMENT_SERVER;

    const apiUrl = BACKEND_URL ? new URL(BACKEND_URL) : undefined;

    const remotePatterns = [];
    if (apiUrl?.hostname) {
      remotePatterns.push({
        protocol: apiUrl.protocol?.replace(":", "") || "https",
        hostname: apiUrl.hostname,
        pathname: "/backend/uploads/**",
      });
    }

    return {
      ...nextConfig,

      allowedDevOrigins: isDev
        ? [process.env.ALLOWED_DEV_ORIGIN ?? ""]
        : undefined,

      images: {
        remotePatterns,
      },
    };
  },
  {
    org: "maxlabs-ab",
    project: "artify",
    // Only print logs for uploading source maps in CI
    // Set to `true` to suppress logs
    silent: !process.env.CI,
    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,

    // Add Readable Stack Traces With Source Maps (Optional)
    authToken: process.env.SENTRY_AUTH_TOKEN,
    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
    // This can increase your server load as well as your hosting bill.
    // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-side errors will fail.
    // Using a fixed route for Turbopack compatibility (middleware needs to exclude this)
    tunnelRoute: "/error-monitoring",

    reactComponentAnnotation: {
      enabled: true,
    },
  }
);
