import type { Manifest } from "@artify/shared";

export const manifests: Manifest[] = [];

export class ManifestModel {
  static findAll(): Manifest[] {
    return manifests;
  }

  static findById(id: string): Manifest | undefined {
    return manifests.find((m) => m.id === id);
  }

  static findByUserId(userId: string): Manifest | null {
    return manifests.find((m) => m.userId === userId) || null;
  }

  static create(
    manifest: Omit<Manifest, "id" | "createdAt" | "updatedAt">
  ): Manifest {
    const newManifest: Manifest = {
      ...manifest,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    manifests.push(newManifest);
    return newManifest;
  }

  static update(id: string, updates: Partial<Manifest>): Manifest | null {
    const manifest = this.findById(id);
    if (!manifest) return null;

    Object.assign(manifest, updates, { updatedAt: new Date() });
    return manifest;
  }

  static delete(id: string): boolean {
    const index = manifests.findIndex((m) => m.id === id);
    if (index === -1) return false;

    manifests.splice(index, 1);
    return true;
  }
}
