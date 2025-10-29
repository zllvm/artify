import { useCallback, useEffect, useState } from "react";

import { ImageAdapter } from "@/adapters/ImageAdapter";
import { formatFileSize } from "@artify/shared/utils/common";

type Props = {
  file: File | null;
  filePreviewUrl: string | null;
  imageUrl: string;
  setImageError: (msg: string | null) => void;
};

export type ImageMetadata = {
  width: number;
  height: number;
  size: string;
  format: string;
  filename?: string;
};

export function useImageMetadata({
  file,
  filePreviewUrl,
  imageUrl,
  setImageError,
}: Props) {
  const [fileMetadata, setFileMetadata] = useState<ImageMetadata | null>(null);

  const [urlMetadata, setUrlMetadata] = useState<ImageMetadata | null>(null);
  const [isValidatingUrl, setIsValidatingUrl] = useState(false);
  const [isUrlImageValid, setIsUrlImageValid] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const extractUrlMetadata = useCallback(
    async (url: string) => {
      if (!url) return;
      setIsValidatingUrl(true);
      setIsUrlImageValid(false);
      setImageError(null);

      try {
        const data = await ImageAdapter.fetchProxyImage(url);
        setUrlMetadata({
          width: data.width,
          height: data.height,
          size: data.size,
          format: data.originalFormat || data.outputFormat,
          filename: data.filename,
        });
        setImagePreviewUrl(data.image);
        setIsUrlImageValid(true);
      } catch (err) {
        console.error("Image metadata fetch failed:", err);
        setImageError("Unable to load image from URL - check the link");
        setIsUrlImageValid(false);
      } finally {
        setIsValidatingUrl(false);
      }
    },
    [setImageError]
  );

  useEffect(() => {
    if (file && filePreviewUrl) extractFileMetadata(file, filePreviewUrl);
  }, [file, filePreviewUrl]);

  useEffect(() => {
    if (imageUrl && imageUrl.startsWith("http")) {
      void (async () => {
        await extractUrlMetadata(imageUrl);
      })();
    } else if (!imageUrl) {
      setUrlMetadata(null);
      setIsUrlImageValid(false);
      setImagePreviewUrl(null);
    }
  }, [imageUrl, extractUrlMetadata]);

  const extractFileMetadata = (file: File, dataUrl: string) => {
    const img = new Image();
    img.onload = () =>
      setFileMetadata({
        width: img.width,
        height: img.height,
        size: formatFileSize(file.size),
        format: file.type.split("/")[1].toUpperCase(),
        filename: file.name,
      });
    img.src = dataUrl;
  };

  return {
    fileMetadata,
    urlMetadata,
    isValidatingUrl,
    isUrlImageValid,
    imagePreviewUrl,
  };
}
