import { API_URL } from "@/config";

export type ProxyImageResponse = {
  filename: string;
  originalFormat: string;
  outputFormat: string;
  size: string;
  thumbnailSize?: string;
  width: number;
  height: number;
  image: string; // base64 thumbnail
};

export class ImageAdapter {
  static async fetchProxyImage(url: string): Promise<ProxyImageResponse> {
    const endpoint = `${API_URL}/api/paintings/proxy/image?url=${encodeURIComponent(
      url
    )}`;

    const res = await fetch(endpoint);
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Failed to fetch image: ${res.status} ${text}`);
    }

    return (await res.json()) as ProxyImageResponse;
  }
}
