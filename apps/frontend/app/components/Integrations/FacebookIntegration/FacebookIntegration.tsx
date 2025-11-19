"use client";

import { useEffect, useState } from "react";

import { ShareAdapter } from "@/adapters/ShareAdapter";
import { useAuth } from "@/hooks";
import { formatDateTime } from "@/utils/dateUtils";
import { AnyShare, Platform } from "@artify/shared";
import { faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Toolbox } from "../Toolbox/Toolbox";
import styles from "./FacebookIntegration.module.css";

import type { FacebookShare } from "@artify/shared";

type FacebookIntegrationProps = {
  paintingId: string;
  onClose?: () => void;
  onCreated?: (share: FacebookShare) => void;
  onUpdated?: (share: FacebookShare) => void;
  share?: FacebookShare;
};

type ChangeAliasModalProps = {
  initialAlias: string;
  onConfirm: (newTitle: string) => void;
  onCancel: () => void;
};

function ChangeAliasModal({
  initialAlias,
  onConfirm,
  onCancel,
}: ChangeAliasModalProps) {
  const [alias, setAlias] = useState(initialAlias);

  return (
    <div className="modalOverlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modalHeader">
          <h2>Change share alias</h2>
        </div>
        <input
          type="text"
          value={alias}
          onChange={(e) => setAlias(e.target.value)}
          className="input"
        />
        <div className={styles.modalActions}>
          <div></div>
          <div className={styles.mainActions}>
            <button className={`btn btn--subtle`} onClick={onCancel}>
              Cancel
            </button>
            <button
              className={`btn btn--inverse`}
              onClick={() => onConfirm(alias)}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FacebookIntegration({
  paintingId,
  onClose,
  onCreated,
  onUpdated,
  share,
}: FacebookIntegrationProps) {
  // const [toolboxMenuOpen, setToolboxMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alias, setAlias] = useState("");
  const [errors, setErrors] = useState<{ artifyShareId?: string }>({});

  const [selectedArtifyShare, setSelectedArtifyShare] = useState<string>(
    share?.artify?.shareId ?? ""
  );
  const [availableArtifyShares, setAvailableArtifyShares] = useState<
    AnyShare[]
  >([]);

  const [showChangeAlias, setShowChangeAlias] = useState(false);

  const { user } = useAuth();

  const isExisting = !!share;
  const isPublished = share?.isPublished ?? false;
  const isReadonly = isPublished;

  useEffect(() => {
    async function loadArtifyShares() {
      const shares = await ShareAdapter.getByPaintingId(paintingId);
      const artifyShares = shares.filter(
        (s) => s.platform === Platform.Artify && s.isPublished
      );
      setAvailableArtifyShares(artifyShares);
    }
    void loadArtifyShares();
  }, [paintingId]);

  useEffect(() => {
    if (share) {
      setAlias(share.alias || "");
    }
  }, [share]);

  const handleSaveAlias = async (newAlias: string) => {
    try {
      const updatedShare = await ShareAdapter.update<Platform.Facebook>(
        share!.id,
        {
          alias: newAlias,
        }
      );
      if (updatedShare) {
        setAlias(updatedShare.alias || "");
        onUpdated?.(updatedShare);
      }
    } catch (error) {
      console.error("Error updating alias:", error);
    }
    setShowChangeAlias(false);
  };

  const handleSubmit = async (action: "draft" | "publish") => {
    const newErrors: { artifyShareId?: string } = {};
    // if (!description.trim()) newErrors.description = "Description is required.";
    // if (tags.length === 0) newErrors.tags = "Please add at least one tag.";

    // if (Object.keys(newErrors).length > 0) return;
    if (!selectedArtifyShare)
      newErrors.artifyShareId = "Please select an Artify share to link.";
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    if (!share && !user) return;

    setLoading(true);

    try {
      const url = `${window.location.origin}/art/${selectedArtifyShare}`;
      // return;
      if (action === "publish") {
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            url
          )}`,
          "facebook-share-dialog",
          "width=626,height=436"
        );
      }

      if (isExisting) {
        const updated = await ShareAdapter.update<Platform.Facebook>(share.id, {
          alias,
          isPublished: action === "publish",
          linkedShareId: selectedArtifyShare,
        });
        if (updated) {
          onUpdated?.(updated);
        }
      } else {
        const created = await ShareAdapter.create<Platform.Facebook>({
          paintingId,
          userId: user!.id,
          alias: alias.trim() || undefined,
          platform: Platform.Facebook,
          isPublished: action === "publish",
          linkedShareId: selectedArtifyShare,
        });

        if (created) {
          onCreated?.(created);
        }

        onClose?.();
      }
    } catch (err) {
      console.error("Error creating share:", err);
      alert("Failed to create share.");
    } finally {
      setLoading(false);
    }
  };

  async function handleDelete() {
    if (!share) return;
    if (!confirm("Delete this share?")) return;
    await ShareAdapter.delete(share.id);
    onUpdated?.(share);
    onClose?.();
  }

  function onView() {
    if (share && isExisting) {
      const url = `/art/${share.id}`;
      window.open(url, "_blank", "noopener,noreferrer");
    }
  }

  async function handleUnpublish() {
    if (!share) return;
    const updated = await ShareAdapter.unpublish<Platform.Facebook>(share.id);
    if (updated) onUpdated?.(updated);
  }

  if (!user) {
    return (
      <div className={styles.content}>
        <div className={styles.title}>
          <h2>Please log in to share your artwork</h2>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.content}>
      <div className={styles.titleRow}>
        <div className={styles.titleLeft}>
          {isExisting ? (
            <>
              <h2 className={styles.platformName}>{Platform.Facebook}: </h2>
              <h2 className={styles.platformMode}>Edit share</h2>
            </>
          ) : (
            <>
              <h2 className={styles.platformName}>{Platform.Facebook}: </h2>
              <h2 className={styles.platformMode}>Create new share</h2>
            </>
          )}
        </div>

        {isExisting && (
          <div className={styles.statusBadgeContainer}>
            {isPublished ? (
              <span className={styles.statusBadge}>Published</span>
            ) : (
              <span className={styles.statusBadgeDraft}>Draft</span>
            )}
          </div>
        )}
        <Toolbox
          onClose={onClose}
          onDelete={
            isExisting && !isReadonly ? () => void handleDelete() : undefined
          }
          onView={share && isExisting ? onView : undefined}
          onSave={() => void handleSubmit("draft")}
          onPublish={
            !isReadonly ? () => void handleSubmit("publish") : undefined
          }
          onUnpublish={isReadonly ? () => void handleUnpublish() : undefined}
        />
      </div>
      {isExisting && (
        <div
          className={`${styles.metaInfo} ${
            share?.isPublished ? styles.publishedMeta : ""
          }`}
        >
          {share && (
            <>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Created:</span>{" "}
                <span className={styles.metaValue}>
                  {formatDateTime(share.createdAt)}
                </span>
              </div>
              {share.isPublished && share.publishDate && (
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Published:</span>{" "}
                  <span className={styles.metaValue}>
                    {formatDateTime(share.publishDate)}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      )}

      <div className={styles.property}>
        <div className={styles.labelContainer}>
          <div className={styles.label}>
            <span>
              Alias <span className="note">(Optional)</span>
            </span>
          </div>
          {isReadonly && (
            <div className={styles.propertyActions}>
              <button
                className="btn btn--form"
                onClick={() => setShowChangeAlias(true)}
              >
                Change alias
              </button>
            </div>
          )}
        </div>
        <div className={styles.value}>
          {isReadonly ? (
            <div className={styles.aliasRO}>{alias}</div>
          ) : (
            <input
              className="input"
              type="text"
              placeholder="Alias can help to quickly find your share"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
            />
          )}
        </div>
      </div>
      <div className={styles.property}>
        <div className={styles.labelContainer}>
          <div className={styles.label}>
            <span>Link Artify Share</span>
          </div>
        </div>
        <div className={styles.value}>
          <select
            className={styles.select}
            value={selectedArtifyShare}
            onChange={(e) => {
              const selectedId = e.target.value;
              const selected = availableArtifyShares.find(
                (s) => s.id === selectedId
              );
              if (selected) {
                setSelectedArtifyShare(selected.id);
                setErrors((prev) => ({ ...prev, artifyShareId: undefined }));
              }
            }}
            disabled={loading || isReadonly}
          >
            <option value="">None</option>
            {availableArtifyShares.map((s) => (
              <option key={s.id} value={s.id}>
                {s.alias || s.title || s.id}
              </option>
            ))}
          </select>

          {errors.artifyShareId && (
            <div className={styles.errorText}>{errors.artifyShareId}</div>
          )}
        </div>
      </div>

      <div className={styles.note}>
        Publishing to Facebook requires a manual step. After publishing, a
        Facebook share dialog will open for you to complete the process.
      </div>
      <div className={styles.actions}>
        {/* <div className={styles.extraActions}>
          {!isReadonly && isExisting && (
            <button
              className="btn btn--subtle btn--danger btn--slim"
              onClick={() => void handleDelete()}
              disabled={loading}
            >
              <FontAwesomeIcon icon={faTrash} /> Delete
            </button>
          )}
        </div> */}
        <div className={styles.normalActions}>
          {/* <button
            className="btn btn--subtle"
            onClick={onClose}
            disabled={loading}
          >
            {isExisting ? "Close" : "Discard"}
          </button> */}
          {!isReadonly && (
            <>
              <button
                className="btn btn--subtle"
                onClick={() => void handleSubmit("draft")}
                disabled={loading}
              >
                {isExisting ? "Save" : "Save Draft"}
              </button>
              {/* {isExisting && (
                <Link
                  href={`/art/${share.id}`}
                  key={share.id}
                  className="btn btn--subtle"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Preview
                </Link>
              )} */}
              <button
                className="btn btn--act"
                onClick={() => void handleSubmit("publish")}
                disabled={loading}
              >
                Publish
              </button>
            </>
          )}

          {isReadonly && (
            <button
              className="btn btn--subtle"
              onClick={() => void handleUnpublish()}
              disabled={loading}
            >
              <FontAwesomeIcon
                icon={faEyeSlash}
                className={styles.iconMarginRight}
              />
              Unpublish
            </button>
          )}
        </div>
      </div>
      {showChangeAlias && (
        <ChangeAliasModal
          initialAlias={alias || ""}
          onConfirm={(newAlias) => void handleSaveAlias(newAlias)}
          onCancel={() => setShowChangeAlias(false)}
        />
      )}
    </div>
  );
}
