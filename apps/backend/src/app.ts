import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import OpenAI from "openai";
import passport from "passport";

import config from "./config/environment.js";
import { UserRepository } from "./repositories/userRepository.js";
import { createRoutes } from "./routes/index.js";
import { configureGoogleStrategy } from "./services/authService.js";
import { ChatGptService, OpenAiClient } from "./services/chatGptService.js";
import JwtService from "./services/jwtService.js";

export const createApp = () => {
  const app = express();

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);

        // Allow localhost and cloudflare tunnel domains
        if (origin === config.app.frontendUrl) {
          return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
    })
  );

  app.use("/backend/uploads", express.static("uploads"));

  app.use(express.json());
  app.use(cookieParser());
  app.use(passport.initialize());
  // app.use(passport.session());

  const userRepo = new UserRepository();

  const userJwt = new JwtService({
    privateKey: config.jwt.privateKey,
    publicKey: config.jwt.publicKey,
    algorithm: config.jwt.algorithm,
    audience: config.jwt.audience,
    issuer: config.jwt.issuer,
    defaultExpiresIn: config.jwt.expiresIn,
  });

  const serviceJwt = new JwtService({
    privateKey: config.jwt.privateKey,
    publicKey: config.jwt.publicKey,
    algorithm: config.jwt.algorithm,
    audience: config.jwtService.audience,
    issuer: config.jwtService.issuer,
    defaultExpiresIn: config.jwtService.expiresIn,
  });

  const configuredPassport = configureGoogleStrategy(
    {
      clientId: config.google.clientId,
      clientSecret: config.google.clientSecret,
      callbackUrl: config.google.redirectUri,
    },
    userRepo,
    userJwt
  );

  const openai = new OpenAI({
    apiKey: config.openai.apiKey,
  });

  const aiClient = new OpenAiClient(openai);
  const service = new ChatGptService(aiClient);

  app.use(
    "/backend",
    createRoutes(configuredPassport, service, userJwt, serviceJwt, userRepo)
  );

  return app;
};
