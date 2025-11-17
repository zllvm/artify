import { headers } from "next/headers";

import ClientLayoutShell from "./ClientLayoutShell";
import styles from "./Layout.module.css";
import SidebarContainer from "./SidebarContainer";

type LayoutProps = {
  children: React.ReactNode;
};

export default async function Layout({ children }: LayoutProps) {
  const hdrs = await headers();
  const pathname = hdrs.get("x-current-path") ?? "/";

  return (
    <div className={styles.container}>
      <SidebarContainer initialPath={pathname} />
      <ClientLayoutShell>{children}</ClientLayoutShell>
    </div>
  );
}
