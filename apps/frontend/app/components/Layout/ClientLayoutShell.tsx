"use client";

// import { useUi } from "@/context/uiContext";

import styles from "./Layout.module.css";

type LayoutProps = {
  children: React.ReactNode;
};

export default function ClientLayoutShell({ children }: LayoutProps) {
  // const { isSidebarOpen, modal, closeModal } = useUi();

  return (
    <main className={styles.main}>
      {children}
      {/* <div
        className={isSidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}
      >
        {children}
      </div>

      {modal && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            {modal}
          </div>
        </div>
      )} */}
    </main>
  );
}
