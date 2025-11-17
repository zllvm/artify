import passport from "passport";
import {
  Strategy as GoogleStrategy,
  StrategyOptionsWithRequest,
} from "passport-google-oauth20";

import { IUser } from "../models/user.js";
import { UserRepository } from "../repositories/userRepository.js";
import JwtService from "./jwtService.js";

import type { Request } from "express";
import type {
  GoogleCallbackParameters,
  Profile,
  VerifyCallback,
} from "passport-google-oauth20";

export const configureGoogleStrategy = (
  config: {
    clientId: string;
    clientSecret: string;
    callbackUrl: string;
  },
  userRepo: UserRepository,
  jwtService: JwtService
) => {
  const options: StrategyOptionsWithRequest = {
    clientID: config.clientId,
    clientSecret: config.clientSecret,
    callbackURL: config.callbackUrl,
    passReqToCallback: true,
  };

  const googleStrategy = new GoogleStrategy(
    options,
    (
      _req: Request,
      accessToken: string,
      refreshToken: string,
      params: GoogleCallbackParameters,
      profile: Profile,
      done: VerifyCallback
    ): void => {
      void (() => {
        try {
          const user = userRepo.findOrCreateFromGoogle(profile);
          const { token, expireAt } = jwtService.generateJwt({ id: user.id });
          user.token = token;
          user.tokenExpiresAt = expireAt;
          user.isAuthenticated = true;
          done(null, user);
        } catch (err) {
          done(err as Error);
        }
      })();
    }
  );

  passport.use(googleStrategy);

  passport.serializeUser((user: IUser, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id: string, done) => {
    void (() => {
      try {
        const user = userRepo.get(id);
        done(null, user);
      } catch (err) {
        done(err as Error);
      }
    })();
  });

  return passport;
};
