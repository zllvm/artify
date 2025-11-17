"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";

import { useAuth } from "@/hooks";
import {
  faGear,
  faHome,
  faImages,
  faUpload,
  faUserShield,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import styles from "./Sidebar.module.css";

export default function Sidebar({ initialPath }: { initialPath: string }) {
  const { user, logout } = useAuth();
  const [showContextMenu, setShowContextMenu] = useState(false);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname() || initialPath;

  const adminLinks =
    user?.role === "admin"
      ? [{ href: "/admin", label: "Admin", icon: faUserShield }]
      : [];

  const links = [
    { href: "/", label: "Home", icon: faHome },
    { href: "/gallery", label: "Gallery", icon: faImages },
    { href: "/upload", label: "Upload", icon: faUpload },
    { href: "/settings", label: "Settings", icon: faGear },
    ...adminLinks,
  ];

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
        {links.map(({ href, label, icon }) => {
          const isActive =
            href === "/" ? pathname === href : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={`${styles.navLink} ${isActive ? styles.active : ""}`}
            >
              <div className={styles.navIcon}>
                <FontAwesomeIcon icon={icon} className={styles.icon} />
              </div>
              <div className={`${styles.navItem} ${styles.truncate}`}>
                {label}
              </div>
            </Link>
          );
        })}
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
              {(user.name || user.email)?.charAt(0).toUpperCase() || "U"}
            </div>
            <span className={styles.userName}>{user.name || user.email}</span>
            {showContextMenu && (
              <div className={styles.contextMenu}>
                <button
                  className={styles.contextMenuItem}
                  onClick={() => {
                    setShowContextMenu(false);
                    void logout();
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
