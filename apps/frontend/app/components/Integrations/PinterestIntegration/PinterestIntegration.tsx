import { useEffect, useState } from "react";

import { PaintingAdapter } from "@/adapters/PaintingAdapter";
import { PinterestAdapter } from "@/adapters/PinterestAdapter";
import { ShareAdapter } from "@/adapters/ShareAdapter";
import AutoGrowTextarea from "@/components/Inputs/AutoGrowTextarea";
import { useAuth } from "@/hooks";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchBoards } from "@/store/pinterestSlice";
import { formatDateTime } from "@/utils/dateUtils";
import { AnyShare, PinterestShare, Platform } from "@artify/shared";
import { faEyeSlash, faLightbulb } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Toolbox } from "../Toolbox/Toolbox";
import styles from "./PinterestIntegration.module.css";

// import type { PinterestState } from "@/store/pinterestSlice";
export type PinterestIntegrationProps = {
  paintingId: string;
  onClose?: () => void;
  onCreated?: (share: PinterestShare) => void;
  onUpdated?: (share: PinterestShare) => void;
  share?: PinterestShare;
};

// type Props = PinterestIntegrationProps & {
//   preloadedState?: { pinterest: PinterestState };
// };

type ChangeTitleModalProps = {
  initialAlias: string;
  onConfirm: (newTitle: string) => void;
  onCancel: () => void;
};

function ChangeAliasModal({
  initialAlias,
  onConfirm,
  onCancel,
}: ChangeTitleModalProps) {
  const [alias, setAlias] = useState(initialAlias);

  return (
    <>
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
    </>
  );
}

export default function PinterestIntegration({
  paintingId,
  onClose,
  onCreated,
  onUpdated,
  share,
}: PinterestIntegrationProps) {
  const [loading, setLoading] = useState(false);
  const [alias, setAlias] = useState("");
  const [showChangeAlias, setShowChangeAlias] = useState(false);
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [selectedBoardId, setSelectedBoardId] = useState<string>("");
  const [pinId, setPinId] = useState<string | null>(null);
  const [artifyShare, setArtifyShare] = useState<string | null>(
    share?.artify?.shareId ?? null
  );
  const [availableArtifyShares, setAvailableArtifyShares] = useState<
    AnyShare[]
  >([]);
  const [errors, setErrors] = useState<{
    description?: string;
    tags?: string;
    boardId?: string;
  }>({});
  const [suggesting, setSuggesting] = useState<{
    desc: boolean;
    tags: boolean;
  }>({
    desc: false,
    tags: false,
  });

  const { user } = useAuth();

  const dispatch = useAppDispatch();
  const boards = useAppSelector((state) => state.pinterest.boards);
  const loadingBoards = useAppSelector((state) => state.pinterest.loading);
  const errorBoards = useAppSelector((state) => state.pinterest.error);

  const isExisting = !!share;
  const isPublished = share?.isPublished ?? false;
  const isReadonly = isPublished;

  const maxDescriptionLength = 500;

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
      setDescription(share.description || "");
      setTags(share.tags || []);
      setSelectedBoardId(share.metadata?.boardId || "");
      setPinId(share.metadata?.pinId || null);
    }
  }, [share]);

  const handleSaveAlias = async (newAlias: string) => {
    try {
      const updatedShare = await ShareAdapter.update<Platform.Pinterest>(
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
    const newErrors: { description?: string; tags?: string; boardId?: string } =
      {};
    if (!description.trim()) newErrors.description = "Description is required.";
    if (tags.length === 0) newErrors.tags = "Please add at least one tag.";
    if (!selectedBoardId) newErrors.boardId = "Please select a board.";
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);

    try {
      if (isExisting) {
        if (action === "publish" && !share.isPublished) {
          const updated = await PinterestAdapter.publishShare(share.id);
          onUpdated?.(updated);
          onClose?.();
          return;
        }
        const updated = await PinterestAdapter.update(share.id, {
          paintingId,
          userId: user!.id,
          alias: alias.trim() || undefined,
          description,
          tags,
          platform: Platform.Pinterest,
          isPublished: action === "publish",
          boardId: selectedBoardId,
          linkedShareId: artifyShare || undefined,
        });

        onUpdated?.(updated);
        onClose?.();
      } else {
        const created = await PinterestAdapter.createShare({
          paintingId,
          userId: user!.id,
          alias: alias.trim() || undefined,
          description,
          tags,
          platform: Platform.Pinterest,
          isPublished: action === "publish",
          boardId: selectedBoardId,
          linkedShareId: artifyShare || undefined,
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

  useEffect(() => {
    if (user?.isPinterestConnected)
      void dispatch(fetchBoards({ silent: true }))
        .unwrap()
        .catch((err) => console.error("Failed to fetch boards", err));
  }, [user, dispatch]);

  const SuggestDescription = async () => {
    setSuggesting((s) => ({ ...s, desc: true }));
    try {
      const painting = await PaintingAdapter.describePainting(paintingId, {
        description: true,
        maxLength: maxDescriptionLength,
      });
      if (painting?.description) {
        setDescription(painting.description);
        if (errors.description)
          setErrors({ ...errors, description: undefined });
      }
    } finally {
      setSuggesting((s) => ({ ...s, desc: false }));
    }
  };

  const SuggestTags = async () => {
    setSuggesting((s) => ({ ...s, tags: true }));
    try {
      const painting = await PaintingAdapter.describePainting(paintingId, {
        tags: true,
      });
      if (painting?.tags) {
        setTags(painting.tags);
        if (errors.tags) setErrors({ ...errors, tags: undefined });
      }
    } finally {
      setSuggesting((s) => ({ ...s, tags: false }));
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      prependTag(newTag);
      // setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  // Add a tag to the beginning
  const prependTag = (tag: string) => {
    if (tag.trim() && !tags.includes(tag.trim())) {
      setTags([tag.trim(), ...tags]);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  async function handleUnpublish() {
    if (!share) return;
    const updated = await PinterestAdapter.unpublish(share.id);
    if (updated) onUpdated?.(updated);
  }

  async function handleDelete() {
    if (!share) return;
    if (!confirm("Delete this share?")) return;
    await PinterestAdapter.delete(share.id);
    onUpdated?.(share);
    onClose?.();
  }

  function onView() {
    if (share?.isPublished && pinId) {
      const url = `https://www.pinterest.com/pin/${pinId}/`;
      window.open(url, "_blank", "noopener,noreferrer");
    }
  }

  if (!user?.isPinterestConnected) {
    const handleConnect = () => {
      const currentPath = window.location.pathname + window.location.search;
      window.location.href = `/backend/pinterest/login?returnTo=${encodeURIComponent(currentPath)}`;
    };

    return (
      <div className={styles.content}>
        <div className={styles.notConnected}>
          <p>Pinterest is not connected.</p>
          <p>Please connect your Pinterest account to share your artwork.</p>
          <button
            onClick={handleConnect}
            className={`btn btn--primary noselect ${styles.btn} ${styles.btnConnect}`}
          >
            Connect
          </button>
        </div>
        <Toolbox onClose={onClose} />
      </div>
    );
  }

  return (
    <div className={styles.content}>
      <div className={styles.titleRow}>
        <div className={styles.titleLeft}>
          {isExisting ? (
            <>
              <h2 className={styles.platformName}>{Platform.Pinterest}:</h2>
              <h2 className={styles.platformMode}>Edit share</h2>
            </>
          ) : (
            <>
              <h2 className={styles.platformName}>{Platform.Pinterest}:</h2>
              <h2 className={styles.platformMode}>Create new share</h2>
              {/* <div className={styles.note}>Share your artwork on Pinterest</div> */}
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
          onView={share?.isPublished && pinId ? onView : undefined}
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
            <span>Board</span>
          </div>
        </div>

        <div className={styles.value}>
          <div
            className={`${styles.selectWrapper} ${
              errors.boardId ? styles.inputError : ""
            }`}
          >
            <select
              className={styles.select}
              value={selectedBoardId}
              onChange={(e) => {
                setSelectedBoardId(e.target.value);
                if (errors.boardId)
                  setErrors((prev) => ({ ...prev, boardId: undefined }));
              }}
              disabled={
                loading || isReadonly || loadingBoards || boards.length === 0
              }
            >
              {loadingBoards ? (
                <option value="">Loading boards...</option>
              ) : errorBoards ? (
                <option value="">Failed to load boards</option>
              ) : boards.length === 0 ? (
                <option value="">No boards available</option>
              ) : (
                <>
                  <option value="">Select a board...</option>
                  {boards.map((board) => (
                    <option key={board.id} value={board.id}>
                      {board.name}
                    </option>
                  ))}
                </>
              )}
            </select>

            <div className={styles.selectIcon}>▾</div>
          </div>
          {loadingBoards && (
            <div className={styles.selectHint}>
              Loading boards from Pinterest…
            </div>
          )}
          {errorBoards && <div className={styles.errorText}>{errorBoards}</div>}

          {errors.boardId && (
            <div className={styles.errorText}>{errors.boardId}</div>
          )}
          {!loadingBoards && !errorBoards && boards.length === 0 && (
            <div className={styles.selectHint}>
              Connect Pinterest or refresh to load boards.
            </div>
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
            value={artifyShare ?? ""}
            onChange={(e) => {
              const selectedId = e.target.value;
              const selected = availableArtifyShares.find(
                (s) => s.id === selectedId
              );
              setArtifyShare(selected ? selected.id : null);
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
        </div>
      </div>
      <div className={styles.property}>
        <div className={styles.labelContainer}>
          <div className={styles.label}>
            <span>Description</span>
          </div>
          {!isReadonly && (
            <div className={styles.propertyActions}>
              <button
                className={`btn btn--ai btn--slim ${suggesting.desc ? "loading" : ""}`}
                onClick={() => {
                  void SuggestDescription();
                }}
                disabled={loading || suggesting.desc}
              >
                <FontAwesomeIcon
                  icon={faLightbulb}
                  className={`${styles.iconMarginRight} icon`}
                />
                {suggesting.desc ? "Generating..." : "Suggest"}
              </button>
            </div>
          )}
        </div>
        <div className={styles.value}>
          <AutoGrowTextarea
            className={`input ${styles.description} ${
              errors.description ? styles.inputError : ""
            }`}
            placeholder="Describe your artwork or hit suggest..."
            value={description}
            disabled={loading || isReadonly}
            maxLength={maxDescriptionLength}
            onChange={(value: string) => {
              setDescription(value);
              if (errors.description)
                setErrors({ ...errors, description: undefined });
            }}
          />
          {errors.description && (
            <div className={styles.errorText}>{errors.description}</div>
          )}
        </div>
      </div>
      <div className={styles.property}>
        <div className={styles.labelContainer}>
          <div className={styles.label}>
            <span>Tags</span>
          </div>
          {!isReadonly && (
            <button
              className={`btn btn--ai btn--slim ${suggesting.tags ? "loading" : ""}`}
              onClick={() => {
                void SuggestTags();
              }}
              disabled={loading || isReadonly || suggesting.tags}
            >
              <FontAwesomeIcon
                icon={faLightbulb}
                className={`${styles.iconMarginRight} icon`}
              />
              {suggesting.tags ? "Generating..." : "Suggest"}
            </button>
          )}
        </div>
        <div className={styles.value}>
          <div className={styles.tagsContainer}>
            <div className={styles.tagInputWrapper}>
              <input
                className={`input ${styles.tagInput}`}
                type="text"
                value={newTag}
                disabled={loading || isReadonly}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag or hit suggest..."
                onKeyUp={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <button
                className={styles.addTagBtn}
                onClick={handleAddTag}
                disabled={!newTag.trim()}
                tabIndex={-1}
                type="button"
              >
                +
              </button>
            </div>
          </div>
          {tags.length > 0 && (
            <div className={styles.tagsList}>
              {tags.map((tag) => (
                <div key={tag} className={styles.tagItem}>
                  #{tag}
                  <button
                    className={styles.removeTagBtn}
                    onClick={() => handleRemoveTag(tag)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          {errors.tags && <div className={styles.errorText}>{errors.tags}</div>}
        </div>
      </div>
      <div className={styles.actions}>
        <div className={styles.extraActions}>
          {/* {!isReadonly && isExisting && (
            <button
              className="btn btn--subtle btn--danger btn--slim"
              onClick={() => void handleDelete()}
              disabled={loading}
            >
              <FontAwesomeIcon icon={faTrash} /> Delete
            </button>
          )} */}
        </div>
        <div className={styles.normalActions}>
          {/* <button
            className="btn btn--subtle"
            onClick={onClose}
            disabled={loading}
          >
            {isExisting ? "Close" : "Discard"}
          </button> */}
          {/* {share?.isPublished && pinId && (
            <a
              href={`https://www.pinterest.com/pin/${pinId}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--subtle"
            >
              View on Pinterest
            </a>
          )} */}
          {!isReadonly && (
            <>
              <button
                className="btn btn--subtle"
                onClick={() => void handleSubmit("draft")}
                disabled={loading}
              >
                {isExisting ? "Save" : "Save Draft"}
              </button>
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
