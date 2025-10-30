import type { NextConfig } from "next";

console.log("Building Next.js with environment variables:");
console.log({
  NODE_ENV: process.env.NODE_ENV,
  API_URL: process.env.API_URL,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  HOSTNAME: process.env.HOSTNAME,
  PORT: process.env.PORT,
});

const nextConfig: NextConfig = {
  output: "standalone",
};

export default nextConfig;
