"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { PinterestAdapter } from "@/adapters/PinterestAdapter";
import { useAuth } from "@/hooks";

import styles from "./page.module.css";
import SettingsIntegrations from "./SettingsIntegrations/SettingsIntegrations";

const integrations = [
  {
    id: "pinterest",
    label: "Pinterest",
    color: "#E60023",
    apiPath: "/backend/pinterest/login",
    description:
      "Publish your art to inspire collectors and creators on Pinterest.",
  },
  {
    id: "instagram",
    label: "Instagram",
    color: "#E4405F",
    apiPath: "/backend/instagram/login",
    description: "Share your art and stories with your followers on Instagram.",
  },
];

export default function SettingsPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const params = useSearchParams();
  const connected = params.get("connected");

  useEffect(() => {
    if (connected === "pinterest") {
      router.replace("/settings");
    }
  }, [connected, router]);

  const handleConnect = (id: string) => {
    const apiPath = integrations.find((int) => int.id === id)?.apiPath;
    if (!apiPath) return;

    window.location.href = apiPath;
  };

  const handleDisconnect = async (id: string) => {
    if (id === "pinterest") {
      try {
        await PinterestAdapter.disconnect();
        await refreshUser();
      } catch (error) {
        console.error("Failed to disconnect Pinterest:", error);
      }
    }
  };

  return (
    <main className={`${styles.container}`}>
      <div className={`${styles.workPanel} scroll`}>
        <div className={styles.pageTitle}>Settings</div>
        <div className={styles.connectedSection}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionSubtitle}>Installed Connectors</h3>
            <div className={styles.note}>
              These connectors allow you to share your art to different
              platforms.
            </div>
          </div>
          {user && (
            <SettingsIntegrations
              integrations={integrations
                .filter((integration) => {
                  if (integration.id === "pinterest") {
                    return !!user?.isPinterestConnected;
                  }
                  return false;
                })
                .map((integration) => ({
                  ...integration,
                  connected:
                    integration.id === "pinterest"
                      ? !!user?.isPinterestConnected
                      : false,
                }))}
              onDisconnect={(id) => {
                void handleDisconnect(id);
              }}
            />
          )}
        </div>
        <div className={styles.connectorSection}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionSubtitle}>Available Connectors</h3>
            <div className={styles.note}>
              Connect your accounts to share your art. You are always in control
              of your data.
            </div>
          </div>
          {user && (
            <SettingsIntegrations
              integrations={integrations
                .filter((integration) => {
                  if (integration.id === "pinterest") {
                    return !user?.isPinterestConnected;
                  }
                  return true;
                })
                .map((integration) => ({
                  ...integration,
                  connected:
                    integration.id === "pinterest"
                      ? !!user?.isPinterestConnected
                      : false,
                }))}
              onConnect={handleConnect}
            />
          )}
        </div>
      </div>
    </main>
  );
}
