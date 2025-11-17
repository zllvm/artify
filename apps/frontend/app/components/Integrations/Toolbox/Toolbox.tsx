import { ReactElement, useEffect, useRef, useState } from "react";

import { capitalize } from "@/utils/common";

import styles from "./Toolbox.module.css";

export function Toolbox({
  top,
  right,
  onView,
  onPreview,
  onSave,
  onPublish,
  onUnpublish,
  onClose,
  onDelete,
  menuItems,
  canBeCompact = true,
  darkMode = false,
}: {
  top?: string;
  right?: string;
  onView?: () => void;
  onPreview?: () => void;
  onClose?: () => void;
  onDelete?: () => void;
  onSave?: () => void;
  onPublish?: () => void;
  onUnpublish?: () => void;
  menuItems?: string[];
  canBeCompact?: boolean;
  darkMode?: boolean;
}) {
  const defaultMenuItems = menuItems ?? ["delete"];
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [hasVisibleOptions, setHasVisibleOptions] = useState(true);
  const themeClass = darkMode ? styles.toolboxDark : styles.toolboxLight;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const renderButton = (
    key: string,
    onClick?: () => void,
    icon?: ReactElement,
    isFoldable: boolean = true
  ) => (
    <button
      key={key}
      className={`${styles[key + "Button"]} ${isFoldable ? styles.foldable : ""}`}
      onClick={onClick}
      aria-label={capitalize(key)}
      title={capitalize(key)}
    >
      {icon}
    </button>
  );
  const renderMenuButton = (
    key: string,
    onClick?: () => void,
    icon?: ReactElement
  ) => (
    <div
      key={key}
      className={`${styles.option}  ${defaultMenuItems.includes(key) ? styles.default : ""}`}
      onClick={() => {
        onClick?.();
        setOpen?.(false);
      }}
    >
      <button className={styles[key + "Button"]} aria-label={capitalize(key)}>
        {icon}
      </button>

      <div>{capitalize(key)}</div>
    </div>
  );

  const deleteIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );

  const previewIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M8 4v16" />
    </svg>
  );

  const viewIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

  const saveIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );

  const publishIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 19V5" />
      <polyline points="5 12 12 5 19 12" />
      <path d="M5 19h14" />
    </svg>
  );

  const unpublishIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5v14" />
      <polyline points="19 12 12 19 5 12" />
      <path d="M5 5h14" />
    </svg>
  );

  const closeIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );

  const closeItem = renderButton("close", onClose, closeIcon, false);
  // const closeMenuItem = renderMenuButton("close", onClose, closeIcon);

  const deleteItem = renderButton("delete", onDelete, deleteIcon);
  const deleteMenuItem = renderMenuButton("delete", onDelete, deleteIcon);

  const previewItem = renderButton("preview", onPreview, previewIcon);
  const previewMenuItem = renderMenuButton("preview", onPreview, previewIcon);

  const viewItem = renderButton("view", onView, viewIcon);
  const viewMenuItem = renderMenuButton("view", onView, viewIcon);

  const saveItem = renderButton("save", onSave, saveIcon);
  const saveMenuItem = renderMenuButton("save", onSave, saveIcon);

  const publishItem = renderButton("publish", onPublish, publishIcon);
  const publishMenuItem = renderMenuButton("publish", onPublish, publishIcon);

  const unpublishItem = renderButton("unpublish", onUnpublish, unpublishIcon);
  const unpublishMenuItem = renderMenuButton(
    "unpublish",
    onUnpublish,
    unpublishIcon
  );

  const dropdownItems = [
    { label: "preview", isShown: onPreview, render: previewMenuItem },
    { label: "view", isShown: onView, render: viewMenuItem },
    { label: "save", isShown: onSave, render: saveMenuItem },
    { label: "publish", isShown: onPublish, render: publishMenuItem },
    { label: "unpublish", isShown: onUnpublish, render: unpublishMenuItem },
    { label: "delete", isShown: onDelete, render: deleteMenuItem },
  ].filter((item) => item.isShown);

  useEffect(() => {
    const el = menuRef.current;
    const container = el?.closest(`.${styles.toolbox}`);
    if (!el || !container) return;

    const updateVisibility = () => {
      const options = Array.from(el.querySelectorAll(`.${styles.option}`));
      const visible = options.some((opt) => {
        const style = window.getComputedStyle(opt);
        const isDisplayed = style.display !== "none";
        return isDisplayed;
      });

      setHasVisibleOptions(visible);
    };

    const mutationObserver = new MutationObserver(updateVisibility);
    mutationObserver.observe(el, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class"],
    });

    const resizeObserver = new ResizeObserver(updateVisibility);
    resizeObserver.observe(container);

    updateVisibility();
    requestAnimationFrame(updateVisibility);

    return () => {
      mutationObserver.disconnect();
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      className={`${styles.toolbox} ${themeClass} ${canBeCompact ? styles.compact : ""}`}
      style={{ top: top ?? "0.5rem", right: right ?? "0.5rem" }}
    >
      {onSave && saveItem}
      {onPublish && publishItem}
      {onUnpublish && unpublishItem}
      {onPreview && previewItem}
      {onView && viewItem}
      {onDelete && !defaultMenuItems.includes("delete") && deleteItem}
      {onClose && closeItem}

      <div
        className={`${styles.menuWrapper} ${open ? styles.open : ""}`}
        ref={menuRef}
        data-empty={hasVisibleOptions ? "false" : "true"}
      >
        <button
          className={styles.menuButton}
          aria-label="More options"
          onClick={() => setOpen((o) => !o)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="currentColor"
          >
            <circle cx="12" cy="5" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="12" cy="19" r="1.5" />
          </svg>
        </button>

        <div className={styles.dropdown}>
          {dropdownItems.map((item) => item.render)}
        </div>
      </div>
    </div>
  );
}
