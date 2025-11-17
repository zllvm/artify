import { randomUUID } from "crypto";
import jwt, { SignOptions } from "jsonwebtoken";
import ms from "ms";

import { getUnixTimestamp } from "@artify/shared";

import config from "../config/environment.js";

export interface JwtServiceConfig {
  privateKey: string;
  publicKey: string;
  algorithm: jwt.Algorithm;
  audience: string;
  issuer: string;
  defaultExpiresIn: SignOptions["expiresIn"];
}

export interface JwtCreateOptions {
  id: string;
  expiresIn?: SignOptions["expiresIn"];
}

export interface JwtTokenResult {
  token: string;
  expireAt: Date;
}

export default class JwtService {
  constructor(private readonly config: JwtServiceConfig) {}

  generateJwt({ id, expiresIn }: JwtCreateOptions): JwtTokenResult {
    const now = getUnixTimestamp();

    const payload: jwt.JwtPayload = {
      sub: id,
      iat: now,
      nbf: now - 5,
      jti: randomUUID(),
    };

    const effectiveExpiresIn = expiresIn ?? this.config.defaultExpiresIn;

    const signOptions: SignOptions = {
      algorithm: this.config.algorithm,
      expiresIn: effectiveExpiresIn,
      audience: this.config.audience,
      issuer: this.config.issuer,
    };

    const token = jwt.sign(payload, this.config.privateKey, signOptions);
    const expireAt = this.calculateExpireAt(now, effectiveExpiresIn);

    return { token, expireAt };
  }

  verifyJwt(token: string): jwt.JwtPayload {
    const decoded = jwt.verify(token, config.jwt.publicKey, {
      algorithms: [this.config.algorithm],
      audience: this.config.audience,
      issuer: this.config.issuer,
    });

    if (typeof decoded === "string")
      throw new Error("Invalid token payload type");

    return decoded;
  }

  // Helpers

  private calculateExpireAt(
    issuedAtSeconds: number,
    expiresIn: SignOptions["expiresIn"]
  ): Date {
    const seconds = this.resolveExpiresInSeconds(expiresIn);
    return new Date((issuedAtSeconds + seconds) * 1000);
  }

  private resolveExpiresInSeconds(value: SignOptions["expiresIn"]): number {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const milliseconds: number = ms(value);
      return milliseconds / 1000;
    }
    throw new Error("Invalid expiresIn value");
  }
}
