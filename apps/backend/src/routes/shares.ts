import { Request, Response, Router } from "express";
import { z } from "zod";

import { Platform } from "@artify/shared";

import config from "../config/environment.js";
import { PaintingModel } from "../models/painting.js";
import { ShareModel } from "../models/share.js";
import { logger } from "../utils/logger/logger.js";

import type { RequestHandler } from "express";
import type { ApiResponse, AnyShare } from "@artify/shared";

export const createShareSchema = z.object({
  paintingId: z.string(),
  userId: z.string(),
  alias: z.string().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  platform: z.enum(Platform),
  isPublished: z.boolean().optional(),
  linkedShareId: z.string().optional(),
});

export type CreateShareRequest = z.infer<typeof createShareSchema>;
const updateShareSchema = createShareSchema.partial();

// Create router factory
export const createShareRouter = (
  requireAuth: RequestHandler,
  requireAnyAuth: RequestHandler
) => {
  const router = Router();

  // GET all shares
  router.get("/", requireAuth, (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }
    logger.info("Fetching all shares");
    const shares = ShareModel.findByUserId(req.user.id);
    const response: ApiResponse<AnyShare[]> = { success: true, data: shares };
    res.json(response);
  });

  // GET share by ID
  router.get("/:id", requireAnyAuth, (req: Request, res: Response) => {
    try {
      const share = ShareModel.findById(req.params.id);
      if (!share) {
        return res
          .status(404)
          .json({ success: false, error: "Share not found" });
      }

      if (!share.isPublished && req.user?.id !== share.userId) {
        return res.status(403).json({ success: false, error: "Forbidden" });
      }

      res.json({ success: true, data: share });
    } catch (err) {
      logger.error("Error fetching share", err as Error);
      res.status(500).json({ success: false, error: "Failed to fetch share" });
    }
  });

  router.get(
    "/painting/:paintingId",
    requireAnyAuth,
    (req: Request, res: Response) => {
      try {
        const shares = ShareModel.findByPaintingId(req.params.paintingId);

        const allowedShares = shares.filter(
          (s) => s.isPublished || req.user?.id === s.userId
        );

        res.json({ success: true, data: allowedShares });
      } catch (err) {
        logger.error("Error fetching shares by painting ID", err as Error);
        res
          .status(500)
          .json({ success: false, error: "Failed to fetch shares" });
      }
    }
  );

  router.post("/", requireAuth, (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    try {
      const parsed = createShareSchema.parse(req.body);

      const painting = PaintingModel.findById(parsed.paintingId);

      let artifyLink;
      if (parsed.linkedShareId) {
        artifyLink = {
          shareId: parsed.linkedShareId,
          url: `${config.app.frontendUrl}/art/${parsed.linkedShareId}`,
        };
      }

      const share = ShareModel.create({
        paintingId: parsed.paintingId,
        userId: parsed.userId,
        alias: parsed.alias,
        description: parsed.description,
        tags: parsed.tags,
        platform: parsed.platform,
        isPublished: parsed.isPublished ?? false,
        title: painting?.title,
        images: painting?.images ?? { original: "" },
        artify: artifyLink,
      });

      logger.info("Share created", {
        shareId: share.id,
        platform: parsed.platform,
      });
      res.status(201).json({ success: true, data: share });
    } catch (err) {
      logger.error("Error creating share", err as Error);
      res.status(500).json({ success: false, error: "Failed to create share" });
    }
  });

  router.patch("/:id", requireAuth, (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const existingShare = ShareModel.findById(req.params.id);
    if (!existingShare) {
      return res.status(404).json({ success: false, error: "Share not found" });
    }

    if (existingShare.userId !== req.user.id) {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }

    try {
      const parsed = updateShareSchema.parse(req.body);

      let artifyLink;
      if (parsed.linkedShareId) {
        artifyLink = {
          shareId: parsed.linkedShareId,
          url: `${config.app.frontendUrl}/art/${parsed.linkedShareId}`,
        };
      }

      const updates = { ...parsed, artify: artifyLink };

      const share = ShareModel.update(req.params.id, updates);

      if (!share) {
        return res
          .status(404)
          .json({ success: false, error: "Share not found" });
      }

      const painting = PaintingModel.findById(share.paintingId);
      share.title = painting?.title;

      logger.info("Share updated", { shareId: share.id });
      res.json({ success: true, data: share });
    } catch (err) {
      logger.error("Error updating share", err as Error);
      res.status(500).json({ success: false, error: "Failed to update share" });
    }
  });

  router.post("/:id/publish", requireAuth, (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    try {
      const share = ShareModel.publish(req.params.id);
      if (!share) {
        return res
          .status(404)
          .json({ success: false, error: "Share not found" });
      }

      if (share.userId !== req.user.id) {
        return res.status(403).json({ success: false, error: "Forbidden" });
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

  router.post("/:id/unpublish", requireAuth, (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    try {
      const share = ShareModel.findById(req.params.id);
      if (!share) {
        return res
          .status(404)
          .json({ success: false, error: "Share not found" });
      }

      if (share.userId !== req.user.id) {
        return res.status(403).json({ success: false, error: "Forbidden" });
      }

      if (
        share.platform !== Platform.Artify &&
        share.platform !== Platform.Facebook
      ) {
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

  router.delete("/:id", requireAuth, (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const share = ShareModel.findById(req.params.id);
    if (!share) {
      return res.json({ success: true });
    }

    if (share.userId !== req.user.id) {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }

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
