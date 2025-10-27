import { Request, Response, Router } from 'express';
import { z } from 'zod';

import { Platform } from '@artify/shared';

import { ShareModel } from '../models/share.js';
import { logger } from '../utils/logger.js';

import type { ApiResponse, Share } from "@artify/shared";

export const createShareSchema = z.object({
  paintingId: z.string(),
  userId: z.string(),
  alias: z.string().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  platform: z.nativeEnum(Platform),
  isPublished: z.boolean().optional(),
});

export type CreateShareRequest = z.infer<typeof createShareSchema>;
const updateShareSchema = createShareSchema.partial();

// Create router factory
export const createShareRouter = () => {
  const router = Router();

  // GET all shares
  router.get("/", (_req: Request, res: Response) => {
    logger.info("Fetching all shares");
    const shares = ShareModel.findAll();
    const response: ApiResponse<Share[]> = { success: true, data: shares };
    res.json(response);
  });

  // GET share by ID
  router.get("/:id", (req: Request, res: Response) => {
    try {
      const share = ShareModel.findById(req.params.id);
      if (!share) {
        return res
          .status(404)
          .json({ success: false, error: "Share not found" });
      }
      res.json({ success: true, data: share });
    } catch (err) {
      logger.error("Error fetching share", err as Error);
      res.status(500).json({ success: false, error: "Failed to fetch share" });
    }
  });

  router.post(
    "/",
    (req: Request<unknown, unknown, CreateShareRequest>, res: Response) => {
      try {
        const parsed = createShareSchema.parse(req.body);

        const share = ShareModel.create({
          paintingId: parsed.paintingId,
          userId: parsed.userId,
          alias: parsed.alias,
          description: parsed.description,
          tags: parsed.tags,
          platform: parsed.platform,
          isPublished: parsed.isPublished ?? false,
        });

        logger.info("Share created", {
          shareId: share.id,
          platform: parsed.platform,
        });
        res.status(201).json({ success: true, data: share });
      } catch (err) {
        logger.error("Error creating share", err as Error);
        res
          .status(500)
          .json({ success: false, error: "Failed to create share" });
      }
    }
  );

  router.patch("/:id", (req: Request, res: Response) => {
    try {
      const parsed = updateShareSchema.parse(req.body);
      const share = ShareModel.update(req.params.id, parsed);
      if (!share) {
        return res
          .status(404)
          .json({ success: false, error: "Share not found" });
      }

      logger.info("Share updated", { shareId: share.id });
      res.json({ success: true, data: share });
    } catch (err) {
      logger.error("Error updating share", err as Error);
      res.status(500).json({ success: false, error: "Failed to update share" });
    }
  });

  // PUBLISH a share
  router.post("/:id/publish", (req: Request, res: Response) => {
    try {
      const share = ShareModel.publish(req.params.id);
      if (!share) {
        return res
          .status(404)
          .json({ success: false, error: "Share not found" });
      }

      logger.info("Share published", {
        shareId: share.id,
        platform: share.platform,
      });
      res.json({ success: true, data: share });
    } catch (err) {
      logger.error("Error publishing share", err as Error);
      res
        .status(500)
        .json({ success: false, error: "Failed to publish share" });
    }
  });

  // UNPUBLISH (only allowed for Artify)
  router.post("/:id/unpublish", (req: Request, res: Response) => {
    try {
      const share = ShareModel.findById(req.params.id);
      if (!share) {
        return res
          .status(404)
          .json({ success: false, error: "Share not found" });
      }

      if (share.platform !== Platform.Artify) {
        return res.status(400).json({
          success: false,
          error: `Unpublishing is not supported for platform: ${share.platform}`,
        });
      }

      const updated = ShareModel.unpublish(share.id);
      logger.info("Share unpublished", { shareId: updated?.id });
      res.json({ success: true, data: updated });
    } catch (err) {
      logger.error("Error unpublishing share", err as Error);
      res
        .status(500)
        .json({ success: false, error: "Failed to unpublish share" });
    }
  });

  // DELETE share
  router.delete("/:id", (req: Request, res: Response) => {
    try {
      const success = ShareModel.delete(req.params.id);
      if (!success) {
        return res
          .status(404)
          .json({ success: false, error: "Share not found" });
      }

      logger.info("Share deleted", { shareId: req.params.id });
      res.json({ success: true });
    } catch (err) {
      logger.error("Error deleting share", err as Error);
      res.status(500).json({ success: false, error: "Failed to delete share" });
    }
  });

  return router;
};
