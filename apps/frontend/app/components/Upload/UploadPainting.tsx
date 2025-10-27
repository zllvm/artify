"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { UploadMethod } from "@/hooks/types/UploadMethod";
import { UploadStatus, useUploadPainting } from "@/hooks/useUploadPainting";

import styles from "./UploadPainting.module.css";

export default function UploadPainting() {
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [isUnloading, setIsUnloading] = useState(false);
  const router = useRouter();

  const {
    uploadMethod,
    setUploadMethod,
    status,
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
    uploadedPainting,
  } = useUploadPainting();

  const isUploading = status === UploadStatus.Uploading;
  const imageMetadata =
    uploadMethod === UploadMethod.File ? fileMetadata : urlMetadata;

  const truncateFilename = (filename: string, maxLength = 25) =>
    filename.length <= maxLength
      ? filename
      : filename.slice(0, maxLength) + "...";

  useEffect(() => {
    if (!isUploading) {
      setIsUnloading(true);
      console.log("Starting unloading animation");
      const timeout = setTimeout(() => {
        setIsUnloading(false);
        console.log("Unloading animation ended");
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [isUploading]);

  useEffect(() => {
    if (status === UploadStatus.Success && uploadedPainting) {
      router.push("/share/" + uploadedPainting.id);
    }
  }, [status, uploadedPainting, router]);

  return (
    <div
      className={`${styles.container} scroll ${
        !sidebarVisible ? styles.sidebarHidden : ""
      }`}
    >
      <form className={styles.uploadForm} onSubmit={handleSubmit}>
        <h2
          className={`${styles.formTitle} ${isUploading ? styles.loading : ""}
          }  ${isUnloading ? styles.unloading : ""}`}
        >
          <span>Share Your Artwork</span>
        </h2>
        <div className={styles.previewContainer}>
          <div
            className={`${styles.imagePreviewArea} ${
              isDragging ? styles.dragging : ""
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {imageError ? (
              <div className={styles.previewError} aria-live="polite">
                <img
                  src="/images/warn_image.png"
                  alt="Warning"
                  className={styles.errorIcon}
                />
                <p className={styles.errorMessage} aria-live="polite">
                  {imageError}
                </p>
              </div>
            ) : uploadMethod === UploadMethod.File && filePreviewUrl ? (
              <img
                src={filePreviewUrl}
                alt="Preview"
                className={styles.imagePreview}
              />
            ) : uploadMethod === UploadMethod.Url &&
              imageUrl &&
              isUrlImageValid ? (
              <img
                src={imagePreviewUrl || imageUrl}
                alt="Preview"
                className={styles.imagePreview}
              />
            ) : uploadMethod === UploadMethod.Url && isValidatingUrl ? (
              <div className={styles.previewPlaceholder}>
                <p className={styles.placeholderTitle}>Loading image...</p>
              </div>
            ) : (
              <div className={styles.previewPlaceholder}>
                <img
                  src="/images/no_image.png"
                  alt="No image"
                  className={styles.placeholderIcon}
                />
                {isDragging ? (
                  <p className={styles.placeholderText}>
                    Drop your masterpiece here
                  </p>
                ) : (
                  <>
                    <p className={styles.placeholderTitle}>
                      Your canvas awaits
                    </p>
                    <p className={styles.placeholderSubtitle}>
                      Drop, click, or paste to bring your art to life
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        {/* Image Metadata */}
        {imageMetadata &&
          ((uploadMethod === UploadMethod.File && filePreviewUrl) ||
            (uploadMethod === UploadMethod.Url && imageUrl)) && (
            <div className={styles.imageMetadata}>
              <div className={styles.metadataGrid}>
                {imageMetadata.filename && (
                  <div
                    className={`${styles.metadataItem} ${styles.metadataFilename}`}
                  >
                    <span className={styles.metadataLabel}>File:</span>
                    <span
                      className={styles.metadataValue}
                      title={imageMetadata.filename}
                    >
                      {truncateFilename(imageMetadata.filename, 8)}
                    </span>
                  </div>
                )}
                <div className={styles.metadataItem}>
                  <span className={styles.metadataLabel}>Dimensions:</span>
                  <span className={styles.metadataValue}>
                    {imageMetadata.width}×{imageMetadata.height}
                  </span>
                </div>
                {imageMetadata.size !== "unknown" && (
                  <div className={styles.metadataItem}>
                    <span className={styles.metadataLabel}>Size:</span>
                    <span className={styles.metadataValue}>
                      {imageMetadata.size}
                    </span>
                  </div>
                )}
                <div className={styles.metadataItem}>
                  <span className={styles.metadataLabel}>Format:</span>
                  <span className={styles.metadataValue}>
                    {imageMetadata.format}
                  </span>
                </div>
              </div>
            </div>
          )}
        <div className={styles.addPainting}>
          <div className={styles.formGroup}>
            <div className={styles.uploadMethodTabs}>
              <button
                type="button"
                className={`${styles.tabButton} ${
                  uploadMethod === UploadMethod.File ? styles.active : ""
                }`}
                onClick={() => setUploadMethod(UploadMethod.File)}
              >
                Image File
              </button>
              <button
                type="button"
                className={`${styles.tabButton} ${
                  uploadMethod === UploadMethod.Url ? styles.active : ""
                }`}
                onClick={() => setUploadMethod(UploadMethod.Url)}
              >
                Image URL
              </button>
            </div>
          </div>
          <div className={styles.uploadMethodContent}>
            {uploadMethod === UploadMethod.File ? (
              <div className={styles.fileUploadArea}>
                <div className={styles.inputControlWrapper}>
                  <label
                    className={`${styles.fileInputLabel} btn btn--form noselect`}
                    htmlFor="file-input-with-info"
                  >
                    Choose File
                  </label>
                  <input
                    id="file-input-with-info"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      handleFileSelect(e.target.files?.[0] || null);
                      setImageError(null);
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className={styles.urlInputWrapper}>
                <div className={styles.inputControlWrapper}>
                  <input
                    id="url-input-with-info"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    aria-label="Image URL"
                    disabled={isValidatingUrl}
                    value={imageUrl}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    className={imageError ? styles.error : ""}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        <button
          className={styles.uploadBtn}
          type="submit"
          disabled={isUploading}
        >
          {isUploading ? "Uploading..." : "Upload Painting"}
        </button>
      </form>
    </div>
  );
}
