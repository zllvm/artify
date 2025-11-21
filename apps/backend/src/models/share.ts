import {
  AnyShare,
  MetadataMap,
  Platform,
  Share,
  ShareFor,
} from "@artify/shared";

type CreateShareInput<P extends Platform> = Omit<
  ShareFor<P>,
  "id" | "createdAt" | "updatedAt" | "publishDate"
>;

type UpdateShareInput<P extends Platform> = Partial<
  Omit<ShareFor<P>, "id" | "createdAt" | "updatedAt">
>;

export class ShareModel {
  private static shares: Array<AnyShare> = [];

  static create<P extends Platform>(data: CreateShareInput<P>): ShareFor<P> {
    const now = new Date();

    const share: ShareFor<P> = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      publishDate: data.isPublished ? now : undefined,
    };

    this.shares.push(share);
    return share;
  }

  // --- findById ---
  static findById<P extends Platform>(
    id: string,
    platform: P
  ): Share<MetadataMap[P]> | undefined;
  static findById(id: string): AnyShare | undefined;

  static findById<P extends Platform>(
    id: string,
    platform?: P
  ): AnyShare | undefined {
    const share = this.shares.find(
      (s) => s.id === id && (!platform || s.platform === platform)
    );
    return share;
  }

  static findByPaintingId<P extends Platform>(
    paintingId: string,
    platform: P
  ): Share<MetadataMap[P]>[];

  static findByPaintingId(paintingId: string): Array<AnyShare>;

  static findByPaintingId<P extends Platform>(
    paintingId: string,
    platform?: P
  ): Array<AnyShare> {
    return this.shares.filter(
      (s) =>
        s.paintingId === paintingId && (!platform || s.platform === platform)
    );
  }

  static getByPlatform<P extends Platform>(platform: P): ShareFor<P>[] {
    return this.shares.filter((s): s is ShareFor<P> => s.platform === platform);
  }

  static findAll(): Array<AnyShare> {
    return this.shares;
  }

  static findByUserId(userId: string): Array<AnyShare> {
    return this.shares.filter((s) => s.userId === userId);
  }

  static update<P extends Platform>(
    id: string,
    updates: UpdateShareInput<P>
  ): Share<MetadataMap[P]> | undefined {
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

    if (typeof updates.artify === "object" && updates.artify !== null) {
      share.artify = {
        ...share.artify,
        ...updates.artify,
      };
    }

    Object.assign(share, updates, { updatedAt: now });
    return share as Share<MetadataMap[P]>;
  }

  static publish(id: string): AnyShare | undefined {
    const share = this.findById(id);
    if (!share) return undefined;
    share.isPublished = true;
    share.publishDate = new Date();
    share.updatedAt = new Date();
    return share;
  }

  static unpublish(id: string): AnyShare | undefined {
    const share = this.findById(id);
    if (!share) return undefined;

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
