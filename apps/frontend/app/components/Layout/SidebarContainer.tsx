"use client";

import { useCallback, useEffect } from "react";

import { useIsMobile } from "@/hooks";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setIsOpenDesktop,
  setIsOpenMobile,
  setWidthDesktop,
  setWidthMobile,
} from "@/store/sidebarState";
import { isInteractiveClick } from "@/utils/dom";
import { faChevronLeft, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Sidebar from "../Sidebar/Sidebar";
import styles from "./SidebarContainer.module.css";

type SidebarContainerProps = {
  initialPath: string;
  onStateChange?: (state: {
    collapsedDesktop: boolean;
    collapsedMobile: boolean;
  }) => void;
};

export default function SidebarContainer({
  initialPath,
  onStateChange,
}: SidebarContainerProps) {
  const dispatch = useAppDispatch();
  const isMobile = useIsMobile();

  const { isOpenDesktop, isOpenMobile, widthDesktop, widthMobile } =
    useAppSelector((state) => state.sidebar);

  const collapsedDesktop = !isOpenDesktop;
  const collapsedMobile = !isOpenMobile;

  useEffect(() => {
    onStateChange?.({ collapsedDesktop, collapsedMobile });
  }, [collapsedDesktop, collapsedMobile, onStateChange]);

  useEffect(() => {
    if (isMobile) {
      dispatch(setWidthMobile(isOpenMobile ? 220 : 48));
    } else {
      dispatch(setWidthDesktop(isOpenDesktop ? 220 : 48));
    }
  }, [isMobile, isOpenDesktop, isOpenMobile, dispatch]);

  const openSidebar = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (isInteractiveClick(e)) return;
      if (isMobile) {
        if (collapsedMobile) dispatch(setIsOpenMobile(true));
      } else {
        if (collapsedDesktop) dispatch(setIsOpenDesktop(true));
      }
    },
    [isMobile, collapsedDesktop, collapsedMobile, dispatch]
  );

  const closeSidebar = useCallback(() => {
    if (isMobile) {
      if (!collapsedMobile) dispatch(setIsOpenMobile(false));
    } else {
      if (!collapsedDesktop) dispatch(setIsOpenDesktop(false));
    }
  }, [isMobile, collapsedDesktop, collapsedMobile, dispatch]);

  const showCollapseButton =
    (isMobile && !collapsedMobile) || (!isMobile && !collapsedDesktop);

  const collapsed = isMobile ? collapsedMobile : collapsedDesktop;
  const currentWidth = isMobile ? widthMobile : widthDesktop;

  return (
    <>
      <aside
        className={[
          styles.sidebar,
          collapsed ? styles.collapsed : "",
          isMobile ? styles.mobile : styles.desktop,
        ].join(" ")}
        style={{ width: `${currentWidth}px` }}
        onClick={openSidebar}
      >
        <Sidebar initialPath={initialPath} />
        {showCollapseButton && (
          <button
            className={styles.collapseBtn}
            onClick={closeSidebar}
            aria-label={isMobile ? "Close sidebar" : "Collapse sidebar"}
          >
            <FontAwesomeIcon icon={isMobile ? faXmark : faChevronLeft} />
          </button>
        )}
      </aside>
      {isMobile && !collapsedMobile && (
        <div
          className={`modalOverlay ${styles.overlay}`}
          onClick={() => dispatch(setIsOpenMobile(false))}
        />
      )}
    </>
  );
}
