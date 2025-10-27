import type { AnyFile } from "@artify/shared/types/crossPlatform";

export function detectImageFormatFromUrl(url: string): string | null {
  const lower = url.toLowerCase();
  if (lower.includes(".jpg") || lower.includes(".jpeg")) return "JPG";
  if (lower.includes(".png")) return "PNG";
  if (lower.includes(".gif")) return "GIF";
  if (lower.includes(".webp")) return "WEBP";
  if (lower.includes(".svg")) return "SVG";
  return null;
}

export function getFilenameFromUrl(url: string): string | null {
  return url.split("/").pop()?.split("?")[0] || null;
}

export function detectImageFormat({
  contentType,
  url,
  sharpFormat,
  file,
}: {
  contentType?: string;
  url?: string;
  sharpFormat?: string;
  file?: AnyFile;
}): string | null {
  // 1 File MIME
  if (file?.type?.startsWith("image/")) {
    return file.type.split("/")[1].toUpperCase();
  }

  // 2 HTTP header
  if (contentType?.startsWith("image/")) {
    return contentType.split("/")[1].toUpperCase();
  }

  // 3 Sharp metadata
  if (sharpFormat) {
    return sharpFormat.toUpperCase();
  }

  // 4 File extension from URL
  if (url) {
    return detectImageFormatFromUrl(url);
  }

  return null;
}
