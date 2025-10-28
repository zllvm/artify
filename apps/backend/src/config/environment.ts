import dotenv from "dotenv";

dotenv.config();

const baseUrl = process.env.BASE_URL || "http://localhost:3001";

const config = {
  baseUrl: baseUrl,
  frontendUrl: process.env.FRONTEND_URL as string,
  fbAppId: process.env.FB_APP_ID as string,
  fbAppSecret: process.env.FB_APP_SECRET as string,
  fbRedirectUri: process.env.FB_REDIRECT_URI as string,
  googleClientId: process.env.GOOGLE_CLIENT_ID as string,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
  googleRedirectUri: `${baseUrl}${process.env.GOOGLE_REDIRECT_URI}`,
  jwtPrivateKey: Buffer.from(process.env.JWT_PRIVATE_KEY!, "base64").toString(
    "utf-8"
  ),
  jwtPublicKey: Buffer.from(process.env.JWT_PUBLIC_KEY!, "base64").toString(
    "utf-8"
  ),
  openaiApiKey: process.env.OPENAI_API_KEY as string,
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3001,
  env: process.env.NODE_ENV || "development",
};

export default config;
