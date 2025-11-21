"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Toolbox } from "@/components/Integrations/Toolbox/Toolbox";
import Modal from "@/components/Modal/Modal";
import { useIsMobile } from "@/hooks";
import { UploadMethod } from "@/hooks/types/UploadMethod";
import { UploadStatus, useUploadPainting } from "@/hooks/useUploadPainting";

import styles from "./UploadPainting.module.css";

function Help() {
  const [helpVisible, setHelpVisible] = useState(false);
  const showModalSidebar = useIsMobile(1281);

  const toggleHelp = (e: React.FormEvent) => {
    e.preventDefault();
    setHelpVisible(!helpVisible);
  };

  const onCancel = () => {
    setHelpVisible(false);
  };

  let helpContent = (
    <div
      className={`${styles.help} ${!helpVisible ? styles.collapsed : ""} scroll
      ${showModalSidebar ? styles.mobile : ""}`}
    >
      <Image
        src="/images/mona_lisa-thumb2.png"
        alt="Mona Lisa"
        width={200}
        height={300}
        className={styles.helpImage}
      />
      <div className={styles.helpContent}>
        <h3 className={styles.helpTitle}>Quick Guide</h3>

        <div className={styles.helpStep}>
          <div className={styles.helpStepNumber}>1</div>
          <div className={styles.helpStepText}>
            <h4>Upload Your Work</h4>
            <p>Choose a file or paste an image URL</p>
          </div>
        </div>

        <div className={styles.helpStep}>
          <div className={styles.helpStepNumber}>2</div>
          <div className={styles.helpStepText}>
            <h4>Add Context (Optional)</h4>
            <p>
              Create or select a manifest to add your personal artistic vision
            </p>
          </div>
        </div>

        <div className={styles.helpStep}>
          <div className={styles.helpStepNumber}>3</div>
          <div className={styles.helpStepText}>
            <h4>Edit & Enhance</h4>
            <p>Add title, description, tags, and generate content</p>
          </div>
        </div>

        <div className={styles.helpStep}>
          <div className={styles.helpStepNumber}>4</div>
          <div className={styles.helpStepText}>
            <h4>Share Your Art</h4>
            <p>Share directly to social media or copy the link</p>
          </div>
        </div>

        <div className={styles.helpTips}>
          <div className={styles.helpTipsHeader}>
            <img
              src="/images/star_icon.png"
              alt="Tips"
              className={styles.helpTipsIcon}
            />
            <span>Quick Tips</span>
          </div>
          <div className={styles.helpTipsList}>
            <div className={styles.helpTipsItem}>
              <span>Supported formats: JPG, PNG, GIF, WebP</span>
            </div>
            <div className={styles.helpTipsItem}>
              <span>Max file size: 50MB</span>
            </div>
            <div className={styles.helpTipsItem}>
              <span>Manifests help personalize descriptions</span>
            </div>
            <div className={styles.helpTipsItem}>
              <span>Drag & drop files directly</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (showModalSidebar) {
    helpContent = (
      <Modal onCancel={onCancel} isSlim adjustForSidebar>
        <Toolbox
          onClose={onCancel}
          canBeCompact={false}
          right="0.75rem"
          darkMode={false}
        />
        <div className="modal__content">{helpContent}</div>
      </Modal>
    );
  }

  const showHelp = helpVisible || !showModalSidebar;

  return (
    <>
      <button
        className={styles.helpToggleBtn}
        onClick={toggleHelp}
        aria-label={helpVisible ? "Hide help" : "Show help"}
      >
        {helpVisible ? "×" : "?"}
      </button>
      {showHelp && helpContent}
    </>
  );
}

export default function UploadPainting() {
  const [isUnloading, setIsUnloading] = useState(false);
  const router = useRouter();

  const {
    uploadMethod,
    handleSetUploadMethod,
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
    if (isUploading) return;
    const timeoutStart = requestAnimationFrame(() => {
      setIsUnloading(true);
      const timeout = setTimeout(() => {
        setIsUnloading(false);
      }, 2000);
      return () => clearTimeout(timeout);
    });
    return () => cancelAnimationFrame(timeoutStart);
  }, [isUploading]);

  useEffect(() => {
    if (status === UploadStatus.Success && uploadedPainting) {
      router.push("/share/" + uploadedPainting.id);
    }
  }, [status, uploadedPainting, router]);

  return (
    <div className={`${styles.container} scroll `}>
      <div className={styles.formContainer}>
        <Help />
        <form
          className={styles.uploadForm}
          onSubmit={(e) => void handleSubmit(e)}
        >
          <h2
            className={`${styles.formTitle} ${isUploading ? styles.loading : ""}
          }  ${isUnloading ? styles.unloading : ""} noselect`}
          >
            <span>Share Your Artwork</span>
            <div className={styles.brushWrapper}>
              <div className={styles.brushFrame}>
                <Image
                  src="/images/paintbrush.png"
                  alt="Paintbrush"
                  width={48}
                  height={48}
                  priority
                  className={styles.brushIcon}
                />
              </div>
            </div>
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
                  <Image
                    src="/images/warn_image.png"
                    alt="Warning"
                    width={100}
                    height={100}
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
                <div className={`${styles.previewPlaceholder} `}>
                  {/* <div className={styles.noImage} /> */}
                  <Image
                    src="/images/no_image.png"
                    alt="No image"
                    width={80}
                    height={80}
                    priority
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
                  onClick={() => handleSetUploadMethod(UploadMethod.File)}
                >
                  Image File
                </button>
                <button
                  type="button"
                  className={`${styles.tabButton} ${
                    uploadMethod === UploadMethod.Url ? styles.active : ""
                  }`}
                  onClick={() => handleSetUploadMethod(UploadMethod.Url)}
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
    </div>
  );
}
