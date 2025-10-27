import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import OpenAI from 'openai';
import passport from 'passport';

import config from './config/environment.js';
import { UserRepository } from './repositories/userRepository.js';
import { createRoutes } from './routes/index.js';
import { configureGoogleStrategy } from './services/authService.js';
import { ChatGptService, OpenAiClient } from './services/chatGptService.js';

export const createApp = () => {
  const app = express();

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);

        // Allow localhost and cloudflare tunnel domains
        if (origin === config.frontendUrl) {
          return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
    })
  );

  app.use("/uploads", express.static("uploads"));

  app.use(express.json());
  app.use(cookieParser());
  app.use(passport.initialize());
  // app.use(passport.session());

  const userRepo = new UserRepository();
  const configuredPassport = configureGoogleStrategy(
    {
      clientId: config.googleClientId,
      clientSecret: config.googleClientSecret,
      callbackUrl: config.googleRedirectUri,
      jwtPrivateKey: config.jwtPrivateKey,
    },
    userRepo
  );

  const openai = new OpenAI({
    apiKey: config.openaiApiKey,
  });

  const aiClient = new OpenAiClient(openai);
  const service = new ChatGptService(aiClient);

  app.use("/api", createRoutes(configuredPassport, service));

  return app;
};
