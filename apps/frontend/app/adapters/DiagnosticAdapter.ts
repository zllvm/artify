import { API_URL } from "@/config";

import type { ApiResponse } from "@artify/shared";

export interface HealthStatus {
  status: string;
  runtime: Record<string, unknown>;
  config: Record<string, unknown>;
  services: Record<string, unknown>;
}

export class DiagnosticAdapter {
  static async getHealth(): Promise<HealthStatus> {
    const res = await fetch(`${API_URL}/diagnostic/health`, {
      credentials: "include",
    });

    const json = (await res.json()) as ApiResponse<HealthStatus>;

    if (!res.ok) {
      throw new Error(json.error || "Failed to fetch system health");
    }

    return json.data!;
  }

  static async getMe(): Promise<Record<string, unknown>> {
    const res = await fetch(`${API_URL}/diagnostic/me`, {
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch user info");
    }

    const json = (await res.json()) as ApiResponse<Record<string, unknown>>;

    return json.data!;
  }
}
