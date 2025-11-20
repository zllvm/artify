import { useEffect, useState } from "react";

import { PaintingAdapter } from "@/adapters/PaintingAdapter";
import { ShareAdapter } from "@/adapters/ShareAdapter";
import Art from "@/components/Art/Art";
import AutoGrowTextarea from "@/components/Inputs/AutoGrowTextarea";
import { useAuth, useIsMobile } from "@/hooks";
import { useAppSelector } from "@/store/hooks";
import { formatDateTime } from "@/utils/dateUtils";
import { AnyShare, Painting, Platform } from "@artify/shared";
import { faEyeSlash, faLightbulb } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Toolbox } from "../Toolbox/Toolbox";
import styles from "./ArtifyIntegration.module.css";

import type { ArtifyShare } from "@artify/shared";
type ArtifyIntegrationProps = {
  paintingId: string;
  painting: Painting;
  onClose?: () => void;
  onCreated?: (share: ArtifyShare) => void;
  onUpdated?: (share: ArtifyShare) => void;
  share?: ArtifyShare;
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

type PreviewModalProps = {
  share: AnyShare;
  onCancel: () => void;
};

function PreviewModal({ share, onCancel }: PreviewModalProps) {
  const isMobile = useIsMobile();

  const { widthDesktop, widthMobile } = useAppSelector(
    (state) => state.sidebar
  );

  const sidebarWidth = isMobile ? widthMobile : widthDesktop;

  const modalStyle = {
    marginLeft: `${sidebarWidth}px`,
  };

  return (
    <div className="modalOverlay" onClick={onCancel}>
      <div
        className="modal modal--slim modal--dark"
        style={modalStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <Toolbox
          onClose={onCancel}
          canBeCompact={false}
          right="0.75rem"
          darkMode={true}
        />
        <div className="modal__content scroll--dark">
          <Art share={share} enableScroll={false} />
        </div>
      </div>
    </div>
  );
}

export default function ArtifyIntegration({
  paintingId,
  painting,
  onClose,
  onCreated,
  onUpdated,
  share,
}: ArtifyIntegrationProps) {
  // const [toolboxMenuOpen, setToolboxMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alias, setAlias] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [errors, setErrors] = useState<{ description?: string; tags?: string }>(
    {}
  );
  const [suggesting, setSuggesting] = useState<{
    desc: boolean;
    tags: boolean;
  }>({
    desc: false,
    tags: false,
  });
  const [showChangeAlias, setShowChangeAlias] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const { user } = useAuth();

  const isExisting = !!share;
  const isPublished = share?.isPublished ?? false;
  const isReadonly = isPublished;

  useEffect(() => {
    if (share) {
      setAlias(share.alias || "");
      setDescription(share.description || "");
      setTags(share.tags || []);
    }
  }, [share]);

  const handleSaveAlias = async (newAlias: string) => {
    try {
      const updatedShare = await ShareAdapter.update<Platform.Artify>(
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

  const SuggestDescription = () => {
    const fetchedDescription = async () => {
      setSuggesting((s) => ({ ...s, desc: true }));
      try {
        const painting = await PaintingAdapter.describePainting(paintingId, {
          description: true,
        });
        if (painting !== null && painting.description) {
          setDescription(painting.description);
          if (errors.description)
            setErrors({ ...errors, description: undefined });
        }
      } catch (error) {
        console.error("Error fetching suggested description:", error);
      } finally {
        setSuggesting((s) => ({ ...s, desc: false }));
      }
    };
    void fetchedDescription();
  };

  const SuggestTags = () => {
    const fetchedTags = async () => {
      setSuggesting((s) => ({ ...s, tags: true }));
      try {
        const painting = await PaintingAdapter.describePainting(paintingId, {
          tags: true,
        });
        if (painting !== null && painting.tags) {
          setTags(painting.tags);
          if (errors.tags) setErrors({ ...errors, tags: undefined });
        }
      } catch (error) {
        console.error("Error fetching suggested tags:", error);
      } finally {
        setSuggesting((s) => ({ ...s, tags: false }));
      }
    };
    void fetchedTags();
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

  // Add a tag to the end
  // const appendTag = (tag: string) => {
  //   if (tag.trim() && !tags.includes(tag.trim())) {
  //     setTags([...tags, tag.trim()]);
  //   }
  // };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async (action: "draft" | "publish") => {
    const newErrors: { description?: string; tags?: string } = {};
    if (!description.trim()) newErrors.description = "Description is required.";
    if (tags.length === 0) newErrors.tags = "Please add at least one tag.";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);

    try {
      if (isExisting) {
        const updated = await ShareAdapter.update<Platform.Artify>(share.id, {
          alias,
          description,
          tags,
          isPublished: action === "publish",
        });
        if (updated) {
          onUpdated?.(updated);
        }
      } else {
        const created = await ShareAdapter.create<Platform.Artify>({
          paintingId,
          userId: user!.id,
          alias: alias.trim() || undefined,
          description,
          tags,
          platform: Platform.Artify,
          isPublished: action === "publish",
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

  function onPreview() {
    setShowPreview(true);
  }

  function onView() {
    if (share && isExisting) {
      const url = `/art/${share.id}`;
      window.open(url, "_blank", "noopener,noreferrer");
    }
  }

  async function handleUnpublish() {
    if (!share) return;
    const updated = await ShareAdapter.unpublish<Platform.Artify>(share.id);
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
              <h2 className={styles.platformName}>{Platform.Artify}: </h2>
              <h2 className={styles.platformMode}>Edit share</h2>
            </>
          ) : (
            <>
              <>
                <h2 className={styles.platformName}>{Platform.Artify}: </h2>
                <h2 className={styles.platformMode}>Create new share</h2>
              </>
              {/* <div className={styles.note}>Share your artwork on Artify.</div> */}
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
          onPreview={description && tags.length > 0 ? onPreview : undefined}
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
            <span>Description</span>
          </div>
          {!isReadonly && (
            <div className={styles.propertyActions}>
              <button
                className={`btn btn--ai btn--slim ${suggesting.desc ? "loading" : ""}`}
                onClick={SuggestDescription}
                disabled={loading}
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
              onClick={SuggestTags}
              disabled={loading || isReadonly}
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
      {showPreview && (
        <PreviewModal
          share={
            {
              id: "preview",
              paintingId,
              alias: alias || undefined,
              description,
              tags,
              platform: Platform.Artify,
              isPublished: false,
              images: painting.images,
              title: painting.title,
            } as AnyShare
          }
          onCancel={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}
