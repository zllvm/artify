import { useState } from "react";

import { UploadMethod } from "./types/UploadMethod";

type Props = {
  setUploadMethod: (uploadMethod: UploadMethod) => void;
};

export function useFileInput({ setUploadMethod }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- File selection ------------------------------------------------
  const handleFileSelect = (selectedFile: File | null) => {
    if (!selectedFile) {
      setFile(null);
      setFilePreviewUrl(null);
      setError(null);
      return;
    }

    setUploadMethod(UploadMethod.File);

    if (!selectedFile.type.startsWith("image/")) {
      setFile(null);
      setFilePreviewUrl(null);
      setError("We need an image file to create art.");
      return;
    }

    setFile(selectedFile);
    setError(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  // --- URL input -----------------------------------------------------
  const handleUrlChange = (url: string) => {
    setImageUrl(url);
    setError(null);
  };

  // --- Drag & Drop ---------------------------------------------------
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  // --- Reset ---------------------------------------------------------
  const reset = () => {
    setFile(null);
    setFilePreviewUrl(null);
    setImageUrl("");
    setError(null);
  };

  // --- Return values -------------------------------------------------
  return {
    file,
    filePreviewUrl,
    imageUrl,
    setImageUrl,
    isDragging,
    error,
    handleFileSelect,
    handleUrlChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    reset,
  };
}
