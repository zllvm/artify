// "use client";

// import Image from "next/image";
// import { useState } from "react";

// import GuestShell from "@/components/GuestShell/GuestShell";
// import LoginForm from "@/components/Login/Login";
// import { verifySession } from "@/lib/dal";

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

// export default async function AppShell({ children }: AppShellProps) {
//   const session = await verifySession();

//   if (session?.isAuth) {
//     // Authenticated: render Layout Server Component or pass props
//     return <Layout>{children}</Layout>;
//   }

//   return <GuestShell>{children}</GuestShell>;
// }
