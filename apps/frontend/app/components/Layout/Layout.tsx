import { useCallback, useState } from "react";

import { useIsMobile } from "@/hooks";
import { isInteractiveClick } from "@/utils/dom";
import { faChevronLeft, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Sidebar from "../Sidebar/Sidebar";
import styles from "./Layout.module.css";

type LayoutProps = {
  children: React.ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const [collapsedDesktop, setCollapsedDesktop] = useState(false);
  const [collapsedMobile, setCollapsedMobile] = useState(true);

  const isMobile = useIsMobile();

  const openSidebar = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (isInteractiveClick(e)) return;
      isMobile
        ? collapsedMobile && setCollapsedMobile(false)
        : collapsedDesktop && setCollapsedDesktop(false);
    },
    [isMobile, collapsedMobile, collapsedDesktop]
  );

  const closeSidebar = useCallback(() => {
    isMobile
      ? !collapsedMobile && setCollapsedMobile(true)
      : !collapsedDesktop && setCollapsedDesktop(true);
  }, [isMobile, collapsedDesktop, collapsedMobile]);

  const showCollapseButton =
    (isMobile && !collapsedMobile) || (!isMobile && !collapsedDesktop);

  return (
    <div
      className={[
        styles.container,
        collapsedDesktop ? styles.collapsedDesktop : "",
        collapsedMobile ? styles.collapsedMobile : "",
      ].join(" ")}
    >
      <aside className={`${styles.sidebar} `} onClick={openSidebar}>
        <Sidebar />
        {showCollapseButton && (
          <button
            className={`${styles.collapseBtn}`}
            onClick={closeSidebar}
            aria-label={isMobile ? "Close sidebar" : "Collapse sidebar"}
          >
            <FontAwesomeIcon icon={isMobile ? faXmark : faChevronLeft} />
          </button>
        )}
      </aside>

      {/* overlay (for mobile only, shown via CSS) */}
      {isMobile && !collapsedMobile && (
        <div
          className={styles.overlay}
          onClick={() => setCollapsedMobile(true)}
        />
      )}
      <main className={styles.main}>{children}</main>
    </div>
  );
}
