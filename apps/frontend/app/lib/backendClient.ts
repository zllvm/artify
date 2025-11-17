import type { ApiResponse, ApiToken } from "@artify/shared";
import { API_URL } from "../config";

let cachedToken: { token: string; expiresAt: Date } | null = null;
let refreshing: Promise<string> | null = null;

async function fetchNewToken(): Promise<string> {
  const res = await fetch(`${API_URL}/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.SERVICE_CLIENT_ID,
      client_secret: process.env.SERVICE_CLIENT_SECRET,
    }),
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Failed to get service token");
  const json = (await res.json()) as ApiResponse<ApiToken>;
  if (!json.success || !json.data)
    throw new Error(json.error || "Invalid token response");

  cachedToken = {
    token: json.data.token,
    expiresAt: new Date(json.data.expireAt),
  };

  return json.data.token;
}

// async function getServiceToken(): Promise<string> {
//   const now = Date.now() / 1000;
//   if (cachedToken && cachedToken.expiresAt.getTime() / 1000 - 60 > now) {
//     return cachedToken.token;
//   }

//   const res = await fetch(`${API_URL}/auth/token`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({
//       client_id: process.env.SERVICE_CLIENT_ID,
//       client_secret: process.env.SERVICE_CLIENT_SECRET,
//     }),
//   });

//   if (!res.ok) throw new Error("Failed to get service token");
//   const json = (await res.json()) as ApiResponse<ApiToken>;
//   if (!json.success || !json.data)
//     throw new Error(json.error || "Failed to get service token");

//   cachedToken = {
//     token: json.data.token,
//     expiresAt: new Date(json.data.expireAt),
//   };

//   return cachedToken.token;
// }

export async function getServiceToken(): Promise<string> {
  const now = Date.now();
  const buffer = 60_000; // ms = 60 seconds

  if (cachedToken && cachedToken.expiresAt.getTime() - buffer > now) {
    return cachedToken.token;
  }

  if (refreshing) return refreshing;

  refreshing = fetchNewToken();

  try {
    const token = await refreshing;
    return token;
  } finally {
    refreshing = null;
  }
}

export async function fetchBackend(path: string, options?: RequestInit) {
  const token = await getServiceToken();
  return fetch(`${API_URL}${path}`, {
    ...options,
    cache: "no-store",
    headers: {
      ...(options?.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function proxyBackend<T>(
  url: string,
  init: RequestInit
): Promise<ApiResponse<T>> {
  const res = await fetch(url, init);
  const json = (await res.json()) as ApiResponse<T>;
  if (!res.ok) throw new Error(json.error || "Backend error");
  return json;
}
export async function proxyRequest(
  request: Request,
  backendUrl: string
): Promise<Response> {
  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("connection");

  const res = await fetch(backendUrl, {
    method: request.method,
    headers,
    body: request.body,
  });

  // Clone backend headers, but remove encoding-related ones
  const responseHeaders = new Headers(res.headers);
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("content-length"); // may be invalid after decoding
  responseHeaders.delete("transfer-encoding");

  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers: responseHeaders,
  });
}

// export async function proxyRequest(
//   request: Request,
//   backendUrl: string
// ): Promise<Response> {
//   const res = await fetch(backendUrl, {
//     method: request.method,
//     headers: {
//       ...Object.fromEntries(request.headers),
//     },
//     body: request.body,
//   });
//   return new Response(res.body, { status: res.status, headers: res.headers });
// }
