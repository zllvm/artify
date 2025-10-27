import type { Painting } from "@artify/shared";

import { PaintingModel } from '../models/painting.js';

export const getPaintingById = (id: string): Painting | null => {
  return PaintingModel.findById(id) ?? null;
};

export const addPainting = (painting: Painting): void => {
  PaintingModel.create(painting);
};
