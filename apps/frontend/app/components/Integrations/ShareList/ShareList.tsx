"use client";

import { useCallback, useEffect, useState } from "react";

import { ShareAdapter } from "@/adapters/ShareAdapter";

import styles from "./ShareList.module.css";

import type { Share } from "@artify/shared";

type ShareListProps = {
  paintingId: string;
  refreshKey?: number;
  activeShare?: Share | null;
  onSelectShare?: (share: Share) => void;
};

function formatDate(date?: string | Date) {
  if (!date) return "—";
  const d = new Date(date);
  return (
    d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }) +
    " " +
    d.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  );
}

function truncate(text?: string, max = 120) {
  if (!text) return "";
  return text.length > max ? text.slice(0, max) + "…" : text;
}

export default function ShareList({
  paintingId,
  refreshKey,
  onSelectShare,
  activeShare,
}: ShareListProps) {
  const [shares, setShares] = useState<Share[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShares = useCallback(async () => {
    try {
      setLoading(true);
      const all = await ShareAdapter.getAll();
      const filtered = all.filter((s) => s.paintingId === paintingId);
      setShares(filtered);
      setError(null);
    } catch {
      setError("Failed to load shares");
    } finally {
      setLoading(false);
    }
  }, [paintingId]);

  useEffect(() => {
    void fetchShares();
  }, [refreshKey, fetchShares]);

  useEffect(() => {
    const newElements = document.querySelectorAll(`.${styles.shareItem}`);
    newElements.forEach((el) => {
      el.classList.add(styles.fadeIn);
      setTimeout(() => el.classList.remove(styles.fadeIn), 500);
    });
  }, [shares]);

  // async function handlePublish(shareId: string) {
  //   try {
  //     const updated = await ShareAdapter.publish(shareId);
  //     if (updated) {
  //       setShares((prev) => prev.map((s) => (s.id === shareId ? updated : s)));
  //     }
  //   } catch (err) {
  //     console.error("Error publishing share:", err);
  //     alert("Failed to publish share");
  //   }
  // }

  // async function handleUnpublish(shareId: string) {
  //   try {
  //     const updated = await ShareAdapter.unpublish(shareId);
  //     if (updated) {
  //       setShares((prev) => prev.map((s) => (s.id === shareId ? updated : s)));
  //     }
  //   } catch (err) {
  //     console.error("Error unpublishing share:", err);
  //     alert("Failed to unpublish share");
  //   }
  // }

  // async function handleDelete(shareId: string) {
  //   if (!confirm("Are you sure you want to delete this share?")) return;
  //   try {
  //     const success = await ShareAdapter.delete(shareId);
  //     if (success) {
  //       setShares((prev) => prev.filter((s) => s.id !== shareId));
  //     }
  //   } catch (err) {
  //     console.error("Error deleting share:", err);
  //   }
  // }

  if (loading) return <div className={styles.status}>Loading shares...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (shares.length === 0)
    return <div className={styles.status}>No shares created yet.</div>;

  return (
    <div className={styles.shareSection}>
      <div>
        <h3 className={styles.header}>
          Existing Shares
          <span className={styles.sharesCount}> {shares.length}</span>
        </h3>
      </div>
      <div className={styles.shareList}>
        {shares.map((share) => (
          <div
            key={share.id}
            onClick={() => onSelectShare?.(share)}
            className={`${styles.card} ${
              share.isPublished ? styles.published : styles.draft
            } ${activeShare?.id === share.id ? styles.selected : ""}`}
          >
            {/* Header row: platform, alias, status + actions */}
            <div className={styles.cardTitle}>
              <div className={styles.titleText}>
                {share.alias && (
                  <div className={styles.alias}>
                    {truncate(share.alias, 10)}
                  </div>
                )}

                <div
                  className={
                    share.isPublished
                      ? styles.statusBadge
                      : styles.statusBadgeDraft
                  }
                >
                  {share.isPublished ? "Published" : "Draft"}
                </div>
              </div>
              <div className={styles.platform}>
                <span className={styles.platformName}>
                  {share.platform.toUpperCase()}
                </span>
              </div>
            </div>
            {/* <div className={styles.cardHeader}> */}
            {/* <div className={styles.platform}>
                <span className={styles.platformName}>
                  {share.platform.toUpperCase()}
                </span>
                {share.alias && (
                  <span className={styles.alias}>{share.alias}</span>
                )}
                <span
                  className={
                    share.isPublished
                      ? styles.statusBadge
                      : styles.statusBadgeDraft
                  }
                >
                  {share.isPublished ? "Published" : "Draft"}
                </span>
              </div> */}

            {/* <div
                className={styles.actions}
                onClick={(e) => e.stopPropagation()}
              > */}
            {/* {share.isPublished ? (
                  share.platform === "artify" && (
                    <button
                      className="btn btn--subtle btn--slim"
                      onClick={() => handleUnpublish(share.id)}
                    >
                      <FontAwesomeIcon icon={faEyeSlash} />
                      Unpublish
                    </button>
                  )
                ) : (
                  <button
                    className="btn btn--act btn--slim"
                    onClick={() => handlePublish(share.id)}
                  >
                    <FontAwesomeIcon icon={faCloudUploadAlt} />
                    Publish
                  </button>
                )} */}
            {/* </div> */}
            {/* </div> */}

            {/* Tags row */}
            <div className={styles.cardBody}>
              {Array.isArray(share.tags) && share.tags.length > 0 && (
                <div className={styles.tags}>
                  {share.tags.map((tag) => (
                    <span key={tag} className={styles.tag}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Dates row */}
            <div className={styles.cardFooter}>
              <div className={styles.meta}>
                <span>
                  Created: <strong>{formatDate(share.createdAt)}</strong>
                </span>
                {share.isPublished && (
                  <>
                    {/* <span className={styles.metaSeparator}>|</span> */}
                    <span>
                      Published:{" "}
                      <strong>{formatDate(share.publishDate)}</strong>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
