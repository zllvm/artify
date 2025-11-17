import Image from "next/image";

// import { useRouter } from "next/navigation";
// import { useEffect } from "react";
// import { useAuth } from "@/hooks";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import styles from "./Login.module.css";

type LoginFormProps = {
  onClose?: () => void;
};

export default function LoginForm({ onClose }: LoginFormProps) {
  const handleGoogleLogin = () => {
    window.location.href = "/backend/auth/google";
  };

  return (
    <div className={styles.container}>
      {onClose ? (
        <button
          className={`${styles.closeBtn}`}
          onClick={onClose}
          aria-label={"Close log in form"}
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>
      ) : null}
      <div className={styles.card}>
        <div className={styles.logo}>
          <Image src="/logo.png" alt="Artify logo" width={50} height={50} />
          <span className={`logo ${styles.logoText}`}>Artify</span>
        </div>
        <div className={styles.cardText}>
          <h1 className={styles.title}>Log In or Register</h1>
          <p className={styles.subtitle}>Access your creative world</p>
        </div>
        <button
          className={`btn btn--google ${styles.loginBtn} noselect`}
          onClick={handleGoogleLogin}
        >
          <img
            src="/icons/google.svg"
            alt="Google logo"
            className={styles.googleIcon}
          />
          Continue with Google
        </button>
      </div>
    </div>
  );
}
