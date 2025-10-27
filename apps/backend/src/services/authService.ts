import jwt from 'jsonwebtoken';
import passport from 'passport';
import { Strategy as GoogleStrategy, StrategyOptionsWithRequest } from 'passport-google-oauth20';

import { IUser } from '@artify/shared';

import { UserRepository } from '../repositories/userRepository.js';

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
    jwtPrivateKey: string;
  },
  userRepo: UserRepository
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
          const token = jwt.sign(
            { sub: user.id, email: user.email, name: user.displayName },
            config.jwtPrivateKey,
            { algorithm: "RS256", expiresIn: "1h" }
          );
          user.token = token;
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
        const user = userRepo.findById(id);
        done(null, user);
      } catch (err) {
        done(err as Error);
      }
    })();
  });

  return passport;
};
