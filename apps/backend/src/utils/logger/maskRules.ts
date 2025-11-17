import type { MaskRule } from "./mask.js";

export const appMaskRules: Record<string, MaskRule> = {
  privateKey: { reveal: false },
  publicKey: { reveal: false },
  clientSecret: { reveal: false },
  appSecret: { reveal: false },
  apiKey: { reveal: false },
};
