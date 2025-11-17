import { API_URL } from "@/config";

import type { ApiResponse, Platform } from "@artify/shared";
import type { AnyShare, MetadataMap, Share } from "@artify/shared";

export class ShareAdapter {
  // Fetch all shares
  static async getAll(): Promise<AnyShare[]> {
    const res = await fetch(`/api/shares`, {
      credentials: "include",
    });
    const json = (await res.json()) as ApiResponse<AnyShare[]>;
    if (!res.ok) throw new Error(json.error || "Failed to fetch shares");
    return json.data ?? [];
  }

  // Fetch a single share by ID
  static async getById(id: string): Promise<AnyShare | null> {
    const res = await fetch(`/api/shares/${id}`, {
      credentials: "include",
    });
    const json = (await res.json()) as ApiResponse<AnyShare>;
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(json.error || "Failed to fetch share");
    }
    return json.data ?? null;
  }

  static async getByPaintingId(paintingId: string): Promise<AnyShare[]> {
    const res = await fetch(`${API_URL}/shares/painting/${paintingId}`, {
      credentials: "include",
    });
    const json = (await res.json()) as ApiResponse<AnyShare[]>;
    if (!res.ok) {
      throw new Error(json.error || "Failed to fetch shares by painting ID");
    }
    return json.data ?? [];
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
    linkedShareId?: string;
  }): Promise<AnyShare>;

  static async create<P extends Platform>(data: {
    paintingId: string;
    userId: string;
    alias?: string;
    description?: string;
    tags?: string[];
    platform: P;
    isPublished?: boolean;
    linkedShareId?: string;
  }): Promise<Share<MetadataMap[P]>>;

  // --- single implementation ---
  static async create<P extends Platform>(data: {
    paintingId: string;
    userId: string;
    alias?: string;
    description?: string;
    tags?: string[];
    platform: P;
    isPublished?: boolean;
    linkedShareId?: string;
  }): Promise<Share<MetadataMap[P]>> {
    const res = await fetch(`${API_URL}/shares`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });

    const json = (await res.json()) as ApiResponse<AnyShare>;

    if (!res.ok) {
      throw new Error(json.error || "Failed to create share");
    }

    return json.data as Share<MetadataMap[P]>;
  }

  static async update(
    id: string,
    updates: Partial<Omit<AnyShare, "id"> & { linkedShareId?: string }>
  ): Promise<AnyShare | null>;

  static async update<P extends Platform>(
    id: string,
    updates: Partial<Share<MetadataMap[P]> & { linkedShareId?: string }>
  ): Promise<Share<MetadataMap[P]> | null>;

  // single implementation
  static async update<P extends Platform>(
    id: string,
    updates: Partial<Share<MetadataMap[P]> & { linkedShareId?: string }>
  ): Promise<Share<MetadataMap[P]> | null> {
    const res = await fetch(`${API_URL}/shares/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(updates),
    });

    const json = (await res.json()) as ApiResponse<AnyShare>;

    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(json.error || "Failed to update share");
    }

    return json.data as Share<MetadataMap[P]> | null;
  }
  // Publish share
  static async publish(id: string): Promise<AnyShare | null> {
    const res = await fetch(`${API_URL}/shares/${id}/publish`, {
      method: "POST",
      credentials: "include",
    });
    const json = (await res.json()) as ApiResponse<AnyShare>;
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(json.error || "Failed to publish share");
    }
    return json.data ?? null;
  }

  // Unpublish share (only for Artify)
  static async unpublish(id: string): Promise<AnyShare | null>;

  static async unpublish<P extends Platform>(
    id: string
  ): Promise<Share<MetadataMap[P]> | null>;

  static async unpublish<P extends Platform>(
    id: string
  ): Promise<Share<MetadataMap[P]> | null> {
    const res = await fetch(`${API_URL}/shares/${id}/unpublish`, {
      method: "POST",
      credentials: "include",
    });
    const json = (await res.json()) as ApiResponse<AnyShare>;
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(json.error || "Failed to unpublish share");
    }
    return json.data as Share<MetadataMap[P]> | null;
  }

  // Delete share
  static async delete(id: string): Promise<boolean> {
    const res = await fetch(`${API_URL}/shares/${id}`, {
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
