// File: app/privacy/page.tsx (Next.js App Router)
import React from "react";

import styles from "./page.module.css";

export const metadata = {
  title: "Privacy Policy — Artify",
  description:
    "Artify's in-development privacy policy describing what data we collect, how we use it, and your rights.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  const lastUpdated = "2025-10-24";

  const policy = {
    name: "Artify",
    company: "MaxLabs AB",
    email: "contact@maxlabas.se",
    website: "https://artify.maxlabas.se",
    address: "(company address)",
  };

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Privacy Policy</h1>
        <p className={styles.updated}>Last updated: {lastUpdated}</p>
      </header>

      <section className={styles.section}>
        <p>
          This Privacy Policy explains how {policy.company} ("we", "us", or
          "our") handles your information when you use{" "}
          <strong>{policy.name}</strong> (the "Service"). While {policy.name} is
          currently in active development, we aim to follow privacy-by-design
          principles and collect only the minimum data necessary to deliver the
          Service.
        </p>
      </section>

      <section className={styles.section}>
        <h2>What we collect</h2>
        <ul>
          <li>
            <strong>Account & authentication</strong>: If you choose to connect
            your Pinterest account, we process your Pinterest user ID and an
            OAuth access token provided by Pinterest.
          </li>
          <li>
            <strong>Content you create</strong>: Paintings/images you generate
            or upload to share to Pinterest.
          </li>
          <li>
            <strong>Usage data (minimal)</strong>: Basic, anonymized events
            (e.g., share button clicked, errors) to improve reliability. No
            advertising or profiling.
          </li>
          <li>
            <strong>Cookies/Storage</strong>: We may use strictly necessary
            cookies or local storage for session management and CSRF protection.
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>How we use information</h2>
        <ul>
          <li>Authenticate you with Pinterest via OAuth 2.0.</li>
          <li>
            Create Pins to your selected boards on your behalf, only when you
            ask us to.
          </li>
          <li>Troubleshoot, secure, and improve the Service.</li>
          <li>Comply with legal obligations.</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>Third parties we interact with</h2>
        <p>
          We integrate with Pinterest to enable sharing. Your use of Pinterest
          is subject to Pinterest’s own terms and policies. We do not sell your
          data, and we do not share it with advertisers.
        </p>
      </section>

      <section className={styles.section}>
        <h2>Data retention</h2>
        <p>
          OAuth tokens are stored securely and retained only while needed to
          provide the Service. You can disconnect Pinterest at any time, which
          revokes our access. Content you create may be kept while your account
          exists or until you delete it.
        </p>
      </section>

      <section className={styles.section}>
        <h2>Your rights</h2>
        <p>
          Depending on your location (e.g., EU/EEA under GDPR), you may have
          rights to access, correct, delete, or export your data, and to object
          or restrict certain processing. Contact us to exercise these rights.
        </p>
      </section>

      <section className={styles.section}>
        <h2>Security</h2>
        <p>
          We use industry-standard measures to protect your information,
          including encrypted transport (HTTPS), secure storage of OAuth tokens,
          and least-privilege access controls. No method is 100% secure, but we
          work to protect your data.
        </p>
      </section>

      <section className={styles.section}>
        <h2>Children</h2>
        <p>
          The Service is not intended for children under the age of 13 (or the
          minimum age required by your jurisdiction). We do not knowingly
          collect personal data from children.
        </p>
      </section>

      <section className={styles.section}>
        <h2>Changes to this policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will post the
          new version on this page and update the "Last updated" date above. If
          changes are material, we will provide additional notice.
        </p>
      </section>

      <section className={styles.section}>
        <h2>Contact</h2>
        <p>
          If you have questions about this policy or your data, contact us at{" "}
          <a href={`mailto:${policy.email}`}>{policy.email}</a>. Our website is{" "}
          <a href={policy.website} rel="noopener noreferrer">
            {policy.website}
          </a>
          .
        </p>
        {/* <p>{policy.address}</p> */}
      </section>

      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "PrivacyPolicy",
            name: "Privacy Policy",
            url: `${policy.website}/privacy`,
            publisher: {
              "@type": "Organization",
              name: policy.company,
              url: policy.website,
            },
            dateModified: lastUpdated,
          }),
        }}
      />
    </main>
  );
}
