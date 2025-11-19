"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { PaintingAdapter } from "@/adapters/PaintingAdapter";
import { API_URL } from "@/config";

import styles from "./page.module.css";

import type { Painting } from "@artify/shared";

export default function GalleryPage() {
  const [paintings, setPaintings] = useState<Painting[]>([]);

  useEffect(() => {
    async function fetchPaintings() {
      try {
        const paintings = await PaintingAdapter.getAll();
        setPaintings(paintings);
      } catch (error) {
        console.error("Error fetching paintings:", error);
      }
    }

    void fetchPaintings();
  }, []);

  return (
    <div className={`${styles.container} scroll`}>
      <div className={styles.workPanel}>
        <div className={styles.pageTitle}>Gallery</div>
        {paintings.length > 0 ? (
          <div className={styles.grid}>
            {paintings.map((painting) => (
              <Link
                href={`/share/${painting.id}`}
                key={painting.id}
                className={styles.card}
              >
                <div className={styles.imageWrapper}>
                  <Image
                    src={`${API_URL}${painting.images.web}`}
                    alt={painting.title || "Artwork"}
                    width={400}
                    height={400}
                    className={styles.image}
                    sizes="
                (max-width: 768px) 100vw,
                (max-width: 1200px) 20vw,
                1200px
              "
                    priority
                  />
                </div>
                <div className={styles.info}>
                  <h3 className={styles.name}>
                    {painting.title || "Untitled, Yet Perfect"}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className={`${styles.emptyGallery} noselect`}>
            <Link
              href="/upload"
              className={`btn btn--form ${styles.uploadButton}`}
            >
              Upload
            </Link>
            {/* <Link href="/upload" className={styles.uploadGraffitiLink}>
              <Image
                src="/images/textures/upload2.png" // <- Update this path!
                alt="Upload Art"
                width={600} // Adjust based on the actual size and desired scale
                height={600} // Adjust based on the actual size and desired scale
                className={styles.uploadGraffitiImage}
              />
            </Link> */}
            {/* <Image
              src="/images/textures/this-wall-needs-art.png"
              alt="This Wall Needs Art"
              width={300}
              height={300}
              className={styles.graffiti}
            /> */}
          </div>
        )}
      </div>
    </div>
  );
}
