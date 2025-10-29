import { useCallback, useState } from "react";

import {
  PaintingAdapter,
  UploadPaintingResponse,
} from "@/adapters/PaintingAdapter";
import { useFileInput } from "@/hooks/useFileInput";
import { useImageMetadata } from "@/hooks/useImageMetadata";

import { UploadMethod } from "./types/UploadMethod";

import type { ImageMetadata } from "./types/ImageMetadata";
export enum UploadStatus {
  Idle = "idle",
  Uploading = "uploading",
  Success = "success",
  Error = "error",
}

type UseUploadPaintingResult = {
  uploadMethod: UploadMethod;
  status: UploadStatus;
  handleSetUploadMethod: (method: UploadMethod) => void;
  fileMetadata: ImageMetadata | null;
  urlMetadata: ImageMetadata | null;
  isValidatingUrl: boolean;
  isUrlImageValid: boolean;
  imageError: string | null;
  setImageError: React.Dispatch<React.SetStateAction<string | null>>;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleFileSelect: (file: File | null) => void;
  handleUrlChange: (url: string) => void;
  filePreviewUrl: string | null;
  imagePreviewUrl: string | null;
  imageUrl: string;
  isDragging: boolean;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  reset: () => void;
  resetFileInput: () => void;
  uploadedPainting: UploadPaintingResponse | null;
};

export function useUploadPainting(): UseUploadPaintingResult {
  const [uploadMethod, setUploadMethod] = useState<UploadMethod>(
    UploadMethod.File
  );
  const [imageError, setImageError] = useState<string | null>(null);
  const [uploadedPainting, setUploadedPainting] =
    useState<UploadPaintingResponse | null>(null);
  const [status, setStatus] = useState<UploadStatus>(UploadStatus.Idle);

  const {
    file,
    filePreviewUrl,
    imageUrl,
    isDragging,
    handleFileSelect,
    handleUrlChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    reset: resetFileInput,
  } = useFileInput({ setUploadMethod });

  const {
    fileMetadata,
    urlMetadata,
    isValidatingUrl,
    isUrlImageValid,
    imagePreviewUrl,
  } = useImageMetadata({
    file,
    filePreviewUrl,
    imageUrl,
    setImageError,
  });

  const handleSetUploadMethod = (method: UploadMethod) => {
    setUploadMethod(method);
    setImageError(null);
  };

  // useEffect(() => {
  //   setImageError(null);
  // }, [uploadMethod]);

  // --- Upload ------------------------------------------------------
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (status === UploadStatus.Uploading) return;
      setImageError(null);

      const isFile = uploadMethod === UploadMethod.File;
      if (isFile && !file)
        return setImageError("Your canvas is empty - choose an image");
      if (!isFile && !imageUrl.trim())
        return setImageError("Share a link to your artwork");

      setStatus(UploadStatus.Uploading);

      try {
        // Simulate delay for testing loader
        // await new Promise((r) => setTimeout(r, 10000));

        const data = await PaintingAdapter.uploadPainting({
          file: isFile ? (file ?? undefined) : undefined,
          imageUrl: !isFile ? imageUrl : undefined,
        });
        setUploadedPainting(data);
        setStatus(UploadStatus.Success);
      } catch (err) {
        setStatus(UploadStatus.Error);
        if (err instanceof Error) {
          setImageError(err.message);
        } else {
          setImageError("An unknown error occurred.");
        }
      }
    },
    [status, uploadMethod, file, imageUrl, setImageError]
  );

  const reset = () => {
    setImageError(null);
    setStatus(UploadStatus.Idle);
    setUploadMethod(UploadMethod.File);
    setUploadedPainting(null);
    resetFileInput();
  };

  return {
    uploadMethod,
    status,
    handleSetUploadMethod,
    fileMetadata,
    urlMetadata,
    isValidatingUrl,
    isUrlImageValid,
    imageError,
    setImageError,
    handleSubmit,
    handleFileSelect,
    handleUrlChange,
    filePreviewUrl,
    imagePreviewUrl,
    imageUrl,
    isDragging,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    reset,
    resetFileInput,
    uploadedPainting,
  };
}
