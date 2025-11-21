import { ReactNode } from "react";

import { useIsMobile } from "@/hooks";
import { useAppSelector } from "@/store/hooks";

type ModalProps = {
  onCancel: () => void;
  children: ReactNode;
  className?: string;
  isSlim?: boolean;
  isDark?: boolean;
  adjustForSidebar?: boolean;
};

export default function Modal({
  onCancel,
  children,
  className = "",
  isSlim = false,
  isDark = false,
  adjustForSidebar = false,
}: ModalProps) {
  const isMobile = useIsMobile();

  const { widthDesktop, widthMobile } = useAppSelector(
    (state) => state.sidebar
  );

  const sidebarWidth = isMobile ? widthMobile : widthDesktop;

  const modalStyle = adjustForSidebar
    ? {
        marginLeft: `${sidebarWidth}px`,
      }
    : undefined;

  const variantClasses = [isSlim && "modal--slim", isDark && "modal--dark"]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="modalOverlay" onClick={onCancel}>
      <div
        className={`modal ${variantClasses} ${className}`}
        style={modalStyle}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
