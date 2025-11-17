import { API_URL } from "@/config";
import {
  ApiResponse,
  CreatePinterestShareRequest,
  PinterestBoard,
  PinterestBoardsResponse,
  PinterestShare,
  UpdatePinterestShareRequest,
} from "@artify/shared";

export class PinterestAdapter {
  static async getBoards(): Promise<PinterestBoard[]> {
    const res = await fetch(`/backend/pinterest/boards`, {
      credentials: "include",
    });

    const json = (await res.json()) as ApiResponse<PinterestBoardsResponse>;

    if (!res.ok)
      throw new Error(json.error || "Failed to fetch Pinterest boards");

    return json.data?.items ?? [];
  }

  static async disconnect(): Promise<void> {
    const res = await fetch(`${API_URL}/pinterest/disconnect`, {
      method: "DELETE",
      credentials: "include",
    });

    const json = (await res.json()) as ApiResponse<null>;

    if (!res.ok)
      throw new Error(json.error || "Failed to disconnect Pinterest");
  }

  static async createShare(
    request: CreatePinterestShareRequest
  ): Promise<PinterestShare> {
    const res = await fetch(`/backend/pinterest/share`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(request),
    });

    const json = (await res.json()) as ApiResponse<PinterestShare>;

    if (!res.ok)
      throw new Error(json.error || "Failed to publish Pinterest pin");

    return json.data!;
  }

  static async update(
    id: string,
    updates: UpdatePinterestShareRequest
  ): Promise<PinterestShare> {
    const res = await fetch(`/backend/pinterest/share/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(updates),
    });

    const json = (await res.json()) as ApiResponse<PinterestShare>;

    if (!res.ok)
      throw new Error(json.error || "Failed to update Pinterest share");

    return json.data!;
  }

  static async unpublish(id: string): Promise<PinterestShare> {
    const res = await fetch(`/backend/pinterest/share/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    const json = (await res.json()) as ApiResponse<PinterestShare>;

    if (!res.ok)
      throw new Error(json.error || "Failed to delete Pinterest share");

    return json.data!;
  }

  static async delete(id: string): Promise<boolean> {
    await this.unpublish(id);

    const res = await fetch(`/backend/shares/${id}`, {
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

  static async publishShare(id: string): Promise<PinterestShare> {
    const res = await fetch(`/backend/pinterest/share/${id}/publish`, {
      method: "POST",
      credentials: "include",
    });

    const json = (await res.json()) as ApiResponse<PinterestShare>;

    if (!res.ok)
      throw new Error(json.error || "Failed to publish Pinterest share");

    return json.data!;
  }
}
