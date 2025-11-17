import "server-only";

import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { cache } from "react";

import { fetchBackend } from "@/lib/backendClient";
import { decrypt } from "@/lib/session";
import {
  AnyShare,
  ApiResponse,
  PinterestBoard,
  PinterestBoardsResponse,
} from "@artify/shared";

import { API_URL } from "../config";

import type { IUserDto } from "@artify/shared";
import type { SessionPayload } from "@/lib/definitions";
export const verifySession = cache(async (): Promise<SessionPayload | null> => {
  const cookie = (await cookies()).get("jwt")?.value;

  if (!cookie) {
    return null;
    // redirect("/");
  }

  const session = await decrypt(cookie);

  if (!session?.userId) {
    return null;
    // redirect("/");
  }

  return session;
});

export const getUser = cache(async (): Promise<IUserDto | null> => {
  const session = await verifySession();
  if (!session) return null;

  const jwt = (await cookies()).get("jwt")?.value;
  if (!jwt) return null;

  const res = await fetch(`${API_URL}/auth/me`, {
    headers: { Cookie: `jwt=${jwt}` },
    cache: "no-store",
  });

  if (!res.ok) return null;
  const user = (await res.json()) as IUserDto;

  return user;
});

export const getIsPinterestConnected = cache(async (): Promise<boolean> => {
  const user = await getUser();
  return user?.isPinterestConnected ?? false;
});

export const getShareById = cache(
  async (shareId: string): Promise<AnyShare | null> => {
    const res = await fetchBackend(`/shares/${shareId}`, {
      next: { tags: [`share-${shareId}`] },
    });

    const json = (await res.json()) as ApiResponse<AnyShare>;

    if (!res.ok) return null;

    if (!json.success || !json.data) return null;

    if (!json.data.isPublished) {
      const session = await verifySession();
      if (!session) return null;
    }

    return json.data;
  }
);

export function revalidateShareCache(shareId: string) {
  revalidateTag(`share-${shareId}`);
}

export const getPinterestBoards = cache(async (): Promise<PinterestBoard[]> => {
  const jwt = (await cookies()).get("jwt")?.value;
  if (!jwt) return [];

  const res = await fetch(`${API_URL}/pinterest/boards`, {
    headers: { Cookie: `jwt=${jwt}` },
    cache: "no-store",
  });

  if (!res.ok) return [];

  const json = (await res.json()) as ApiResponse<PinterestBoardsResponse>;

  if (!json.success || !json.data) return [];

  return json.data?.items ?? [];
});
