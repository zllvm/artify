"use client";

import { useEffect, useState } from "react";

import { DiagnosticAdapter, HealthStatus } from "@/adapters/DiagnosticAdapter";
import { useAuth } from "@/hooks";

import styles from "./page.module.css";

export default function AdminPage() {
  const { user } = useAuth();

  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);

  const [me, setMe] = useState<Record<string, unknown> | null>(null);
  const [loadingMe, setLoadingMe] = useState(false);
  const [meError, setMeError] = useState<string | null>(null);

  const [showHealth, setShowHealth] = useState(true);

  const fetchMe = async () => {
    setLoadingMe(true);
    setMeError(null);

    try {
      const resp = await DiagnosticAdapter.getMe();
      setMe(resp);
    } catch (err) {
      setMeError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoadingMe(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== "admin") return;

    async function fetchHealth() {
      try {
        const status = await DiagnosticAdapter.getHealth();
        setHealth(status);
      } catch (err) {
        setHealthError(
          err instanceof Error ? err.message : "Unknown error fetching health"
        );
      }
    }

    void fetchHealth();
  }, [user]);

  if (!user) return <div>Please log in</div>;
  if (user.role !== "admin") return <div>Not authorized</div>;

  return (
    <div className={styles.container}>
      <div className={styles.workPanel}>
        <div className={styles.pageTitle}>Admin</div>

        <div className={styles.pageHeader}>
          <div className={styles.actions}>
            <button
              className={styles.actionButton}
              onClick={() => void fetchMe()}
              disabled={loadingMe}
            >
              {loadingMe ? "Loading…" : "Fetch /me"}
            </button>

            <button
              className={styles.actionButton}
              onClick={() => setShowHealth((v) => !v)}
            >
              {showHealth ? "Hide Health" : "Show Health"}
            </button>
          </div>
        </div>

        {/* HEALTH SECTION */}
        {healthError && (
          <div className={styles.error}>Error: {healthError}</div>
        )}
        {!health && !healthError && <div>Loading system health…</div>}

        {health && showHealth && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>System Status</h2>
            </div>
            <pre className={styles.json}>{JSON.stringify(health, null, 2)}</pre>
          </div>
        )}

        {/* USER INFO SECTION */}
        {meError && <div className={styles.error}>Error: {meError}</div>}

        {me && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>User Info (/me)</h2>
            </div>
            <pre className={styles.json}>{JSON.stringify(me, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
