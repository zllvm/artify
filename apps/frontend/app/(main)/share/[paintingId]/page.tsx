"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { PaintingAdapter } from "@/adapters/PaintingAdapter";
import AutoGrowTextarea from "@/components/Inputs/AutoGrowTextarea";
import IntegrationArea from "@/components/Integrations/IntegrationArea";
import ShareList from "@/components/Integrations/ShareList/ShareList";
import { API_URL } from "@/config";
import { Share } from "@artify/shared";
import { faLightbulb } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import styles from "./page.module.css";

import type { Painting } from "@artify/shared";

import type { Manifest } from "@artify/shared";
type ChangeTitleModalProps = {
  paintingId: string;
  initialTitle: string;
  onConfirm: (newTitle: string) => void;
  onCancel: () => void;
};

function ChangeTitleModal({
  paintingId,
  initialTitle,
  onConfirm,
  onCancel,
}: ChangeTitleModalProps) {
  const [title, setTitle] = useState(initialTitle);

  const suggestTitle = async () => {
    try {
      const painting = await PaintingAdapter.describePainting(paintingId, {
        title: true,
      });
      if (painting !== null && painting.title) {
        setTitle(painting.title);
      }
    } catch (error) {
      console.error("Error fetching suggested title:", error);
    }
  };

  return (
    <>
      <div className="modalOverlay" onClick={onCancel} />
      <div className="modal">
        <div className="modalHeader">
          <h2>Change painting title</h2>
        </div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input"
        />
        <div className={styles.modalActions}>
          <div className={styles.extraActions}>
            <button className={`btn btn--ai`} onClick={suggestTitle}>
              <FontAwesomeIcon
                icon={faLightbulb}
                className={styles.iconMarginRight}
              />
              Suggest
            </button>
          </div>
          <div className={styles.mainActions}>
            <button className={`btn btn--subtle`} onClick={onCancel}>
              Cancel
            </button>
            <button
              className={`btn btn--inverse`}
              onClick={() => onConfirm(title)}
              disabled={title.trim() === ""}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

type ChangeManifestModalProps = {
  initialDescription: string;
  onConfirm: (description: string) => void;
  onCancel: () => void;
};

function ChangeManifestModal({
  initialDescription,
  onConfirm,
  onCancel,
}: ChangeManifestModalProps) {
  const [description, setDescription] = useState(initialDescription);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleManifestFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setDescription(text);
    };
    reader.readAsText(file);
  };

  return (
    <>
      <div className="modalOverlay" onClick={onCancel} />
      <div className="modal">
        <div className="modalHeader">
          <h2>Change Manifest Description</h2>
        </div>
        <AutoGrowTextarea
          value={description}
          onChange={(value: string) => setDescription(value)}
          className="input"
          placeholder="Describe this artwork's story, inspiration, or details..."
        />
        <div className={styles.modalActions}>
          <div className={styles.extraActions}></div>
          <div className={styles.mainActions}>
            <button className="btn btn--subtle" onClick={onCancel}>
              Cancel
            </button>
            <button
              className="btn btn btn--subtle"
              onClick={() => fileInputRef.current?.click()}
            >
              Load From File
            </button>
            <input
              type="file"
              accept=".txt,.md,.json"
              ref={fileInputRef}
              className={styles.manifestFileInput}
              onChange={handleManifestFileUpload}
            />
            <button
              className="btn btn--inverse"
              onClick={() => onConfirm(description)}
              disabled={description.trim() === ""}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function SharePage() {
  const { paintingId } = useParams<{ paintingId: string }>();
  const [isNotFound, setIsNotFound] = useState(false);
  const [painting, setPainting] = useState<Painting | null>(null);
  const [showChangeTitle, setShowChangeTitle] = useState(false);
  const [showChangeManifest, setShowChangeManifest] = useState(false);
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeShare, setActiveShare] = useState<Share | null>(null);

  useEffect(() => {
    async function fetchManifest() {
      try {
        const manifest = await PaintingAdapter.getManifest();
        setManifest(manifest);
      } catch (error) {
        console.error("Error fetching manifest:", error);
      }
    }

    fetchManifest();
  }, [paintingId]);

  useEffect(() => {
    async function fetchPainting() {
      try {
        const painting = await PaintingAdapter.getPainting(paintingId);

        if (!painting) {
          setPainting(null);
          setIsNotFound(false);
          return;
        }

        setPainting(painting);
        console.log("Fetched painting:", painting);
      } catch (error) {
        console.error("Error fetching painting:", error);
      }
    }

    if (paintingId) {
      fetchPainting();
      setIsNotFound(false);
    } else {
      setIsNotFound(true);
    }
  }, [paintingId]);

  if (isNotFound || !painting) {
    return <div className={styles.notFound}>Painting not found.</div>;
  }

  async function handleSaveTitle(newTitle: string) {
    if (!paintingId) return;
    try {
      const updated = await PaintingAdapter.updatePainting(paintingId, {
        title: newTitle,
      });
      if (updated) setPainting(updated);
      setShowChangeTitle(false);
    } catch (err) {
      setShowChangeTitle(false);
    }
  }

  async function handleSaveManifest(newDescription: string) {
    if (!paintingId) return;
    try {
      const updated = await PaintingAdapter.updateManifest(newDescription);
      if (updated) setManifest(updated);
      setShowChangeManifest(false);
    } catch (err) {
      setShowChangeManifest(false);
    }
  }

  return (
    <div className={styles.content}>
      <div className={styles.bublik}>
        <div className={styles.artworkSection}>
          <div className={styles.painting}>
            <img
              className={styles.paintingImage}
              src={
                painting.imageUrl.startsWith("http")
                  ? painting.imageUrl
                  : `${API_URL}${painting.imageUrl}`
              }
              alt={painting.title || "Artwork"}
            />
          </div>
          <div className={styles.properties}>
            <div className={styles.property}>
              <div className={styles.title}>
                <div className={styles.label}>Artwork title</div>
                <div className={styles.value}>
                  "{painting.title || "A Mystery on Canvas"}"
                </div>
              </div>
              <div className={styles.changeTitle}>
                <button
                  className={`btn btn--form`}
                  onClick={() => setShowChangeTitle(true)}
                >
                  Change title
                </button>
              </div>
            </div>
            <div className={styles.property}>
              <div className={styles.title}>
                <div className={styles.label}>Manifest</div>
                <div className={styles.value}>
                  {manifest
                    ? `Updated on ${new Date(
                        manifest.updatedAt
                      ).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}`
                    : "No manifest created"}
                </div>
              </div>
              <div className={styles.viewOrCreateManifest}>
                <button
                  className={` btn btn--form`}
                  onClick={() => setShowChangeManifest(true)}
                >
                  {manifest ? "View Manifest" : "Create Manifest"}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.createSection}>
          <IntegrationArea
            paintingId={paintingId}
            share={activeShare || undefined}
            onCreated={(_: Share) => setRefreshKey((k) => k + 1)}
            onUpdated={(share: Share) => {
              setRefreshKey((k) => k + 1);
              setActiveShare(share);
            }}
            onClose={() => setActiveShare(null)}
          />
        </div>
        <div className={styles.listSection}>
          <ShareList
            paintingId={paintingId}
            refreshKey={refreshKey}
            activeShare={activeShare}
            onSelectShare={(share) => setActiveShare(share)}
          />
        </div>
        {showChangeTitle && (
          <ChangeTitleModal
            paintingId={paintingId}
            initialTitle={painting.title || ""}
            onConfirm={handleSaveTitle}
            onCancel={() => setShowChangeTitle(false)}
          />
        )}
        {showChangeManifest && (
          <ChangeManifestModal
            initialDescription={manifest?.content || ""}
            onConfirm={handleSaveManifest}
            onCancel={() => setShowChangeManifest(false)}
          />
        )}
      </div>
    </div>
  );
}
