import axios from "axios";

import config from "../config/environment.js";

export interface TokenResponse {
  accessToken: string;
  expiresIn: number;
}

interface FacebookTokenApiResponse {
  access_token: string;
  expires_in: number;
}

export async function exchangeCodeForToken(
  code: string
): Promise<TokenResponse> {
  const shortRes = await axios.get<FacebookTokenApiResponse>(
    "https://graph.facebook.com/v21.0/oauth/access_token",
    {
      params: {
        client_id: config.fbAppId,
        client_secret: config.fbAppSecret,
        redirect_uri: config.fbRedirectUri,
        code,
      },
    }
  );

  const longRes = await axios.get<FacebookTokenApiResponse>(
    "https://graph.facebook.com/v21.0/oauth/access_token",
    {
      params: {
        grant_type: "fb_exchange_token",
        client_id: config.fbAppId,
        client_secret: config.fbAppSecret,
        fb_exchange_token: shortRes.data.access_token,
      },
    }
  );

  return {
    accessToken: longRes.data.access_token,
    expiresIn: longRes.data.expires_in,
  };
}
