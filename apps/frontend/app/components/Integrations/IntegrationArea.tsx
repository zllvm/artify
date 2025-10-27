import { useEffect, useState } from "react";

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
import styles from "./IntegrationArea.module.css";

import type { Share } from "@artify/shared";
import type { IconName } from "@fortawesome/fontawesome-svg-core";
library.add(faPinterest, faFacebookF, faInstagram, faPalette);

enum Platform {
  Artify = "artify",
  Pinterest = "pinterest",
  Facebook = "facebook",
  Instagram = "instagram",
}

const integrations = [
  Platform.Artify,
  Platform.Pinterest,
  Platform.Facebook,
  Platform.Instagram,
];

type Props = {
  paintingId: string;
  share?: Share;
  onCreated?: (share: Share) => void;
  onUpdated?: (share: Share) => void;
  onClose?: () => void;
};

export default function IntegrationArea({
  paintingId,
  share,
  onCreated,
  onUpdated,
  onClose,
}: Props) {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(
    null
  );

  useEffect(() => {
    if (share) {
      setSelectedPlatform(share.platform as Platform);
    }
  }, [share]);

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
              share={share}
              onClose={() => {
                setSelectedPlatform(null);
                onClose?.();
              }}
              onCreated={onCreated}
              onUpdated={onUpdated}
            />
          ) : selectedPlatform === Platform.Pinterest ? (
            <div>Pinterest Integration Component</div>
          ) : selectedPlatform === Platform.Facebook ? (
            <div>Facebook Integration Component</div>
          ) : selectedPlatform === Platform.Instagram ? (
            <div>Instagram Integration Component</div>
          ) : null}
        </div>
      )}
    </div>
  );
}
