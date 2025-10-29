import { API_URL } from "@/config";

import type { ApiResponse, Painting, Manifest } from "@artify/shared";
export type UploadPaintingResponse = {
  id: string;
  imageUrl: string;
  title?: string;
};

export class PaintingAdapter {
  static async uploadPainting({
    file,
    imageUrl,
  }: {
    file?: File;
    imageUrl?: string;
  }): Promise<UploadPaintingResponse> {
    const formData = new FormData();
    if (file) formData.append("image", file);
    else if (imageUrl) formData.append("imageUrl", imageUrl);
    else throw new Error("No image source provided.");

    const res = await fetch(`${API_URL}/api/paintings/upload`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    const json = (await res.json()) as ApiResponse<UploadPaintingResponse>;

    if (!res.ok) {
      throw new Error(json.error || "Upload failed");
    }

    return json.data as UploadPaintingResponse;
    // delay for testing
    // await new Promise((resolve) => setTimeout(resolve, 5000));
    // return null;
  }

  static async getPainting(paintingId: string): Promise<Painting | null> {
    const res = await fetch(`${API_URL}/api/paintings/${paintingId}`, {
      credentials: "include",
    });

    const json = (await res.json()) as ApiResponse<Painting>;
    if (!res.ok) {
      if (res.status === 404) {
        return null;
      }
      throw new Error(json.error || "Failed to fetch painting");
    }

    return json.data ?? null;
  }

  static async updatePainting(
    paintingId: string,
    updates: Partial<Pick<Painting, "title">>
  ): Promise<Painting | null> {
    const res = await fetch(`${API_URL}/api/paintings/${paintingId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
      credentials: "include",
    });

    const json = (await res.json()) as ApiResponse<Painting>;
    if (!res.ok) {
      if (res.status === 404) {
        return null;
      }
      throw new Error(json.error || "Failed to fetch painting");
    }

    return json.data ?? null;
  }

  // Get manifest
  static async getManifest(): Promise<Manifest | null> {
    const res = await fetch(`${API_URL}/api/manifest`, {
      credentials: "include",
    });

    const json = (await res.json()) as ApiResponse<Manifest>;
    if (!res.ok) {
      if (res.status === 404) {
        return null;
      }
      throw new Error(json.error || "Failed to fetch manifest");
    }

    return json.data ?? null;
  }

  // Update manifest
  static async updateManifest(content: string): Promise<Manifest | null> {
    const res = await fetch(`${API_URL}/api/manifest`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
      credentials: "include",
    });

    const json = (await res.json()) as ApiResponse<Manifest>;
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error("Manifest not found");
      }
      throw new Error(json.error || "Failed to update manifest");
    }

    return json.data ?? null;
  }

  static async describePainting(
    paintingId: string,
    options?: { title?: boolean; description?: boolean; tags?: boolean }
  ): Promise<Painting | null> {
    const params = new URLSearchParams();
    if (options?.title !== undefined)
      params.append("title", String(options.title));
    if (options?.description !== undefined)
      params.append("description", String(options.description));
    if (options?.tags !== undefined)
      params.append("tags", String(options.tags));
    const query = params.toString() ? `?${params.toString()}` : "";
    const res = await fetch(
      `${API_URL}/api/paintings/${paintingId}/describe${query}`,
      {
        method: "POST",
        credentials: "include",
      }
    );
    const json = (await res.json()) as ApiResponse<Painting>;
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error("Painting not found");
      }
      throw new Error(json.error || "Failed to describe painting");
    }
    return json.data ?? null;
  }

  static async getAll(): Promise<Painting[]> {
    const res = await fetch(`${API_URL}/api/paintings`, {
      credentials: "include",
    });

    const json = (await res.json()) as ApiResponse<Painting[]>;
    if (!res.ok) {
      throw new Error(json.error || "Failed to fetch paintings");
    }

    return json.data ?? [];
  }
}
