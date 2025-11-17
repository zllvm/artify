"use client";

import type { IconName } from "@fortawesome/fontawesome-svg-core";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faFacebookF,
  faInstagram,
  faPinterest,
} from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import styles from "./SettingsIntegrations.module.css";

library.add(faPinterest, faFacebookF, faInstagram);

type Integration = {
  id: string;
  label: string;
  color: string;
  apiPath: string;
  connected: boolean;
  description?: string;
};

type Props = {
  integrations: Integration[];
  onConnect?: (apiPath: string) => void;
  onDisconnect?: (id: string) => void;
};

export default function SettingsIntegrations({
  integrations,
  onConnect,
  onDisconnect,
}: Props) {
  const getIconName = (id: string): IconName => {
    switch (id) {
      case "pinterest":
      case "instagram":
        return id as IconName;
      default:
        return "palette";
    }
  };

  return (
    <div className={styles.list}>
      {integrations.map(({ id, label, connected, description }) => (
        <div key={id} className={styles.row}>
          <div className={styles.left}>
            {/* <div className={styles.icon} style={{ backgroundColor: color }}>
              {label[0].toUpperCase()}
            </div> */}
            <FontAwesomeIcon
              icon={["fab", getIconName(id)]}
              className={styles.socialIcon}
            />
            <div>
              <span className={styles.label}>{label}</span>
              {description && (
                <div className={styles.description}>{description}</div>
              )}
            </div>
          </div>
          <div className={styles.right}>
            {connected ? (
              <button
                onClick={() => onDisconnect?.(id)}
                className={`btn ${styles.btn} ${styles.btnDisconnect}`}
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={() => onConnect?.(id)}
                className={`btn btn--primary noselect ${styles.btn} ${styles.btnConnect}`}
              >
                Connect
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
