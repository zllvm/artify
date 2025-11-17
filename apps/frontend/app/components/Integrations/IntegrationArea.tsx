import { useEffect, useState } from "react";

import { Platform } from "@artify/shared";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faFacebookF,
  faInstagram,
  faPinterest,
} from "@fortawesome/free-brands-svg-icons";
import { faPalette } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import ArtifyIntegration from "./ArtifyIntegration/ArtifyIntegration";
import { ArtifyLogoIcon } from "./ArtifyLogoIcon";
import FacebookIntegration from "./FacebookIntegration/FacebookIntegration";
import styles from "./IntegrationArea.module.css";
import PinterestIntegration from "./PinterestIntegration/PinterestIntegration";

import type {
  AnyShare,
  ArtifyShare,
  FacebookShare,
  Painting,
  PinterestShare,
} from "@artify/shared";
import type { IconName } from "@fortawesome/fontawesome-svg-core";
library.add(faPinterest, faFacebookF, faInstagram, faPalette);

const integrations = [
  Platform.Artify,
  Platform.Pinterest,
  Platform.Facebook,
  Platform.Instagram,
];

type Props = {
  paintingId: string;
  painting: Painting;
  share?: AnyShare;
  onCreated?: (share: AnyShare) => void;
  onUpdated?: (share: AnyShare) => void;
  onClose?: () => void;
};

export default function IntegrationArea({
  paintingId,
  painting,
  share,
  onCreated,
  onUpdated,
  onClose,
}: Props) {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(
    share ? share.platform : null
  );

  useEffect(() => {
    if (!share) return;
    if (selectedPlatform !== share.platform) {
      const frame = requestAnimationFrame(() =>
        setSelectedPlatform(share.platform)
      );
      return () => cancelAnimationFrame(frame);
    }
  }, [share, selectedPlatform]);

  const handleShare = (platform: Platform) => {
    setSelectedPlatform(platform);
  };

  function renderIntegrationButton(platform: Platform) {
    let iconName: IconName;
    let btnClass = "";
    let label = platform.charAt(0).toUpperCase() + platform.slice(1);
    let iconElement: React.ReactNode = null;
    switch (platform) {
      case Platform.Artify:
        btnClass = "btn--artify";
        label = "Artify";
        iconElement = <ArtifyLogoIcon className={styles.socialIcon} />;
        break;
      case Platform.Pinterest:
        iconName = "pinterest";
        iconElement = (
          <FontAwesomeIcon
            icon={["fab", iconName]}
            className={styles.socialIcon}
          />
        );
        btnClass = "btn--pinterest";
        break;
      case Platform.Facebook:
        iconName = "facebook-f";
        iconElement = (
          <FontAwesomeIcon
            icon={["fab", iconName]}
            className={styles.socialIcon}
          />
        );
        btnClass = "btn--facebook";
        break;
      case Platform.Instagram:
        iconName = "instagram";
        iconElement = (
          <FontAwesomeIcon
            icon={["fab", iconName]}
            className={styles.socialIcon}
          />
        );
        btnClass = "btn--instagram";
        break;
      default:
        iconName = platform as IconName;
        iconElement = (
          <FontAwesomeIcon
            icon={["fab", iconName]}
            className={styles.socialIcon}
          />
        );
        btnClass = "";
    }
    return (
      <button
        key={platform}
        onClick={() => handleShare(platform)}
        className={`btn btn--social ${btnClass} noselect`}
      >
        {iconElement}
        {label}
      </button>
    );
  }

  return (
    <div className={styles.container}>
      {selectedPlatform === null ? (
        <div className={styles.shareContainer}>
          <div className={styles.shareTo}>
            <div className={styles.header}>Share to</div>
            <div className={styles.availableIntegrations}>
              {integrations.map(renderIntegrationButton)}
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.configureIntegration}>
          {selectedPlatform === Platform.Artify ? (
            <ArtifyIntegration
              paintingId={paintingId}
              share={share as ArtifyShare}
              painting={painting}
              onClose={() => {
                setSelectedPlatform(null);
                onClose?.();
              }}
              onCreated={onCreated}
              onUpdated={onUpdated}
            />
          ) : selectedPlatform === Platform.Pinterest ? (
            <PinterestIntegration
              paintingId={paintingId}
              share={share as PinterestShare}
              onClose={() => {
                setSelectedPlatform(null);
                onClose?.();
              }}
              onCreated={onCreated}
              onUpdated={onUpdated}
            />
          ) : selectedPlatform === Platform.Facebook ? (
            <FacebookIntegration
              paintingId={paintingId}
              share={share as FacebookShare}
              onClose={() => {
                setSelectedPlatform(null);
                onClose?.();
              }}
              onCreated={onCreated}
              onUpdated={onUpdated}
            />
          ) : selectedPlatform === Platform.Instagram ? (
            <div>Instagram Integration Component</div>
          ) : null}
        </div>
      )}
    </div>
  );
}
