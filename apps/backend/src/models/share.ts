import { Platform, Share } from '@artify/shared';

export class ShareModel {
  private static shares: Share[] = [];

  static create(data: Omit<Share, "id" | "createdAt" | "updatedAt">): Share {
    const now = new Date();
    const share: Share = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      publishDate: data.isPublished ? now : undefined,
    };
    this.shares.push(share);
    return share;
  }

  static findById(id: string): Share | undefined {
    return this.shares.find((s) => s.id === id);
  }

  static findByPaintingId(paintingId: string): Share[] {
    return this.shares.filter((s) => s.paintingId === paintingId);
  }

  static findByPlatform(platform: Platform): Share[] {
    return this.shares.filter((s) => s.platform === platform);
  }

  static findByPaintingAndPlatform(
    paintingId: string,
    platform: Platform
  ): Share[] {
    return this.shares.filter(
      (s) => s.paintingId === paintingId && s.platform === platform
    );
  }

  static findAll(): Share[] {
    return [...this.shares];
  }

  static update(
    id: string,
    updates: Partial<Omit<Share, "id" | "createdAt">>
  ): Share | undefined {
    const share = this.findById(id);
    if (!share) return undefined;

    const now = new Date();

    if (typeof updates.isPublished === "boolean") {
      // Handle publish transition
      if (updates.isPublished && !share.isPublished) {
        share.isPublished = true;
        share.publishDate = now;
      }
      // Handle unpublish — only allowed for Artify
      else if (!updates.isPublished && share.isPublished) {
        if (share.platform !== Platform.Artify) {
          throw new Error(
            `Unpublishing is not supported for ${share.platform}`
          );
        }
        share.isPublished = false;
        share.publishDate = undefined;
      }
    }

    Object.assign(share, updates, { updatedAt: now });
    return share;
  }

  static publish(id: string): Share | undefined {
    const share = this.findById(id);
    if (!share) return undefined;
    share.isPublished = true;
    share.publishDate = new Date();
    share.updatedAt = new Date();
    return share;
  }

  static unpublish(id: string): Share | undefined {
    const share = this.findById(id);
    if (!share) return undefined;
    if (share.platform !== Platform.Artify) {
      throw new Error(`Unpublishing is not supported for ${share.platform}`);
    }
    share.isPublished = false;
    share.publishDate = undefined;
    share.updatedAt = new Date();
    return share;
  }

  static delete(id: string): boolean {
    const idx = this.shares.findIndex((s) => s.id === id);
    if (idx === -1) return false;
    if (this.shares[idx].isPublished) {
      throw new Error("Cannot delete a published share");
    }
    this.shares.splice(idx, 1);
    return true;
  }
}
