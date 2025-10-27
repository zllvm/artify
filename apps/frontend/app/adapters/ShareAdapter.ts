import { API_URL } from "@/config";

import type { ApiResponse, Platform } from "@artify/shared";
import type { Share } from "@artify/shared";

export class ShareAdapter {
  // Fetch all shares
  static async getAll(): Promise<Share[]> {
    const res = await fetch(`${API_URL}/api/shares`, {
      credentials: "include",
    });
    const json = (await res.json()) as ApiResponse<Share[]>;
    if (!res.ok) throw new Error(json.error || "Failed to fetch shares");
    return json.data ?? [];
  }

  // Fetch a single share by ID
  static async getById(id: string): Promise<Share | null> {
    const res = await fetch(`${API_URL}/api/shares/${id}`, {
      credentials: "include",
    });
    const json = (await res.json()) as ApiResponse<Share>;
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(json.error || "Failed to fetch share");
    }
    return json.data ?? null;
  }

  // Create a new share
  static async create(data: {
    paintingId: string;
    userId: string;
    alias?: string;
    description?: string;
    tags?: string[];
    platform: Platform;
    isPublished?: boolean;
  }): Promise<Share> {
    const res = await fetch(`${API_URL}/api/shares`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });

    const json = (await res.json()) as ApiResponse<Share>;
    if (!res.ok) throw new Error(json.error || "Failed to create share");
    return json.data!;
  }

  // Update share metadata
  static async update(
    id: string,
    updates: Partial<Omit<Share, "id">>
  ): Promise<Share | null> {
    const res = await fetch(`${API_URL}/api/shares/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
      credentials: "include",
    });

    const json = (await res.json()) as ApiResponse<Share>;
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(json.error || "Failed to update share");
    }
    return json.data ?? null;
  }

  // Publish share
  static async publish(id: string): Promise<Share | null> {
    const res = await fetch(`${API_URL}/api/shares/${id}/publish`, {
      method: "POST",
      credentials: "include",
    });
    const json = (await res.json()) as ApiResponse<Share>;
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(json.error || "Failed to publish share");
    }
    return json.data ?? null;
  }

  // Unpublish share (only for Artify)
  static async unpublish(id: string): Promise<Share | null> {
    const res = await fetch(`${API_URL}/api/shares/${id}/unpublish`, {
      method: "POST",
      credentials: "include",
    });
    const json = (await res.json()) as ApiResponse<Share>;
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(json.error || "Failed to unpublish share");
    }
    return json.data ?? null;
  }

  // Delete share
  static async delete(id: string): Promise<boolean> {
    const res = await fetch(`${API_URL}/api/shares/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    const json = (await res.json()) as ApiResponse<null>;
    if (!res.ok) {
      if (res.status === 404) return false;
      throw new Error(json.error || "Failed to delete share");
    }
    return true;
  }
}
