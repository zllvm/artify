import type { Painting } from "@artify/shared";

export const paintings: Painting[] = [];

export class PaintingModel {
  static findAll(): Painting[] {
    return paintings;
  }

  static findById(id: string): Painting | undefined {
    return paintings.find((p) => p.id === id);
  }

  static findByUserId(userId: string): Painting[] {
    return paintings.filter((p) => p.userId === userId);
  }

  static create(
    painting: Omit<Painting, "id" | "createdAt" | "updatedAt">
  ): Painting {
    const newPainting: Painting = {
      ...painting,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    paintings.push(newPainting);
    return newPainting;
  }

  static update(id: string, updates: Partial<Painting>): Painting | null {
    const painting = this.findById(id);
    if (!painting) return null;

    Object.assign(painting, updates, { updatedAt: new Date() });
    return painting;
  }
}
