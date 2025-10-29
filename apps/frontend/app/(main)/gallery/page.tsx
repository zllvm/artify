"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PaintingAdapter } from "@/adapters/PaintingAdapter";

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
      <h1 className={styles.title}>Gallery</h1>
      <div className={styles.grid}>
        {paintings.map((painting) => (
          <Link
            href={`/share/${painting.id}`}
            key={painting.id}
            className={styles.card}
          >
            <div className={styles.imageWrapper}>
              <img
                src={painting.imageUrl}
                alt={painting.title || "Untitled, Yet Perfect"}
                className={styles.image}
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
    </div>
  );
}
