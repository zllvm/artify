import Image from "next/image";

import { getUser } from "@/lib/dal";

import styles from "./page.module.css";

export default async function HomePage() {
  const user = await getUser();

  if (user?.isAuthenticated) {
  }

  return (
    <section className={styles.container}>
      <div className={styles.inspiration}>
        <div>
          <span className={styles.happiness}>Happiness</span>
          <br />
          should be shared.
        </div>
        <div>
          Your <span className={styles.art}>art</span>, too.
        </div>
        <Image
          src="/images/heart.png"
          alt="sketchy heart"
          width={100}
          height={100}
          className={styles.heart}
        />
      </div>
    </section>
  );
}
