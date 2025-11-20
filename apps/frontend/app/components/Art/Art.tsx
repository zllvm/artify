import Image from "next/image";

import { API_URL } from "@/config";
import { AnyShare } from "@artify/shared";

import styles from "./Art.module.css";

type ArtProps = {
  share: AnyShare;
};

export default function Art({ share }: ArtProps) {
  const paragraphs = share.description?.split(/\n\s*\n+/).filter(Boolean) ?? [];
  return (
    <div className={styles.artContainer}>
      <div className={styles.backgroundGlow}></div>
      <div className={styles.logo}>
        <div className={styles.atrify} />
        <div>Artify Gallery</div>
      </div>

      <div className={`${styles.paintingWrapper} scroll--dark`}>
        <div className={styles.paintingWrapperInner}>
          <div className={styles.imageFrame}>
            <div className={styles.imageAnimWrapper}>
              <Image
                src={`${API_URL}${share.images.web}`}
                alt={share.title || "Artwork"}
                width={1200}
                height={1600}
                className={styles.paintingImage}
                sizes="
                (max-width: 768px) 100vw,
                (max-width: 1200px) 50vw,
                1200px
              "
                priority
              />
            </div>
          </div>
        </div>

        <div className={styles.paintingInfo}>
          <h1 className={styles.title}>{share.title || "Untitled"}</h1>

          {paragraphs.length > 0 && (
            <div className={styles.descriptionWrapper}>
              {paragraphs.map((text, i) => (
                <p key={i} className={styles.paragraph}>
                  {text}
                </p>
              ))}
            </div>
          )}

          <div className={styles.meta}>
            {share.tags && share.tags.length > 0 && (
              <div className={styles.tags}>
                {share.tags.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            )}
          </div>
        </div>
        {share.publishDate && (
          <div className={styles.date}>
            Published{" "}
            {new Date(share.publishDate).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </div>
        )}
      </div>
    </div>
  );
}
