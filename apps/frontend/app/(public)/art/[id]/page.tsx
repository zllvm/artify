import { Metadata } from "next";

import Art from "@/components/Art/Art";
import { getShareById } from "@/lib/dal";

import styles from "./page.module.css";

type ArtPageProps = {
  params: Promise<{ id: string }>;
};

// Generate SEO tags dynamically
export async function generateMetadata({
  params,
}: ArtPageProps): Promise<Metadata> {
  const { id } = await params;
  const share = await getShareById(id);

  if (!share) {
    return {
      title: "Share not found - Artify",
      description: "This artwork could not be found.",
    };
  }

  const paintingUrl = `/art/${share.id}`;
  const imageUrl = `/backend/${share.images.original}`;

  return {
    title: `${share.title || "Untitled"} - Artify`,
    description:
      share.description ||
      "Check out this amazing artwork created with Artify!",
    openGraph: {
      type: "website",
      url: paintingUrl,
      title: share.title,
      description: share.description,
      images: [{ url: imageUrl }],
    },
    twitter: {
      card: "summary_large_image",
      title: share.title,
      description: share.description,
      images: [imageUrl],
    },
  };
}

export default async function ArtPage({ params }: ArtPageProps) {
  const { id } = await params;

  const share = await getShareById(id);

  if (!share) {
    return (
      <div className={styles.notFound}>
        <div className={styles.frameGlow}></div>
        <div className={styles.notFoundInner}>
          <div className={styles.placeholderWrapper}>
            <div className={styles.placeholder}></div>
          </div>
          <h1 className={styles.title}>Oops, no art lives here</h1>
          <p className={styles.subtitle}>
            It seems this piece has vanished into the ether or never existed at
            all.
          </p>
          <a href="/" className={styles.backButton}>
            Return to gallery
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Art share={share} />
    </div>
  );
}
