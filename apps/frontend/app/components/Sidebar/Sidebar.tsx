"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";

import { useAuth } from "@/hooks";
import { faHome, faImages, faUpload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import styles from "./Sidebar.module.css";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const [showContextMenu, setShowContextMenu] = useState(false);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const handleLogin = () => {
    window.location.href = "/";
  };

  return (
    <>
      <div className={styles.sidebarHeader}>
        <div className={styles.logo}>
          <Image
            src="/logo.png"
            alt="Artify logo"
            width={32}
            height={32}
            priority
          />
        </div>
      </div>
      <nav className={styles.nav}>
        <Link href="/" className={styles.navLink}>
          <div className={styles.navIcon}>
            <FontAwesomeIcon icon={faHome} className={styles.icon} />
          </div>
          <div className={`${styles.navItem} ${styles.truncate}`}>Home</div>
        </Link>
        <Link href="/gallery" className={styles.navLink}>
          <div className={styles.navIcon}>
            <FontAwesomeIcon icon={faImages} className={styles.icon} />
          </div>
          <div className={`${styles.navItem} ${styles.truncate}`}>Gallery</div>
        </Link>
        <Link href="/upload" className={styles.navLink}>
          <div className={styles.navIcon}>
            <FontAwesomeIcon icon={faUpload} className={styles.icon} />
          </div>
          <div className={`${styles.navItem} ${styles.truncate}`}>Upload</div>
        </Link>
      </nav>
      <div className={styles.sidebarContent}>
        {/* Main content can go here */}
      </div>
      {user ? (
        <div className={styles.sidebarFooter}>
          <div
            className={`${styles.userProfile} noselect`}
            ref={contextMenuRef}
            onClick={(e) => {
              e.stopPropagation();
              setShowContextMenu((prev) => !prev);
            }}
          >
            <div className={styles.userAvatar}>
              {(user.name || user.displayName || user.email)
                ?.charAt(0)
                .toUpperCase() || "U"}
            </div>
            <span className={styles.userName}>
              {user.name || user.displayName || user.email}
            </span>
            {showContextMenu && (
              <div className={styles.contextMenu}>
                <button
                  className={styles.contextMenuItem}
                  onClick={() => {
                    setShowContextMenu(false);
                    logout();
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className={styles.sidebarFooter}>
          <button className={styles.loginButton} onClick={handleLogin}>
            Log In
          </button>
        </div>
      )}
    </>
  );
}
