import Image from "next/image";

export function ArtifyLogoIcon({ className }: { className?: string }) {
  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Image
        src="/logo.png"
        alt="Artify Logo"
        width={50}
        height={50}
        style={{ objectFit: "contain" }}
      />
    </span>
  );
}
