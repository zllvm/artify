// "use client";

// import Image from "next/image";
// import { useState } from "react";

// import LoginForm from "@/components/Login/Login";

// // import { useAuth } from "@/hooks";
// import Layout from "../Layout/Layout";
// import styles from "./AppShell.module.css";

// import type { ReactNode } from "react";
// type LoginModalProps = {
//   onClose: () => void;
// };

// function LoginModal({ onClose }: LoginModalProps) {
//   return (
//     <>
//       <div className="modalOverlay" onClick={onClose} />
//       <div className={`modal modal--transparent ${styles.loginModal}`}>
//         <LoginForm onClose={onClose} />
//       </div>
//     </>
//   );
// }

// type AppShellProps = {
//   children: ReactNode;
// };

// export function AppShell({ children }: AppShellProps) {
//   const [showLogin, setShowLogin] = useState(false);

//   if (isAuthenticated) {
//     return <Layout>{children}</Layout>;
//   }

//   return (
//     <div className={styles.guestContainer}>
//       <header className={styles.header}>
//         <div className={styles.logo}>
//           <Image src="/logo.png" alt="Artify logo" width={60} height={60} />
//           <span className={`logo ${styles.logoText}`}>artify</span>
//         </div>
//       </header>
//       <main className={styles.main}>{children}</main>
//       <div className={styles.actions}>
//         <button
//           className={`btn btn--primary btn--xl noselect`}
//           onClick={() => setShowLogin(true)}
//         >
//           Log In
//         </button>
//         <button
//           className={`btn btn--outline btn--xl noselect`}
//           onClick={() => setShowLogin(true)}
//         >
//           Sign Up
//         </button>
//       </div>
//       {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
//     </div>
//   );
// }
