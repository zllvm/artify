import { Request, Response, Router } from 'express';
import { z } from 'zod';

import { ManifestModel } from '../models/manifest.js';
import { PaintingModel } from '../models/painting.js';
import { logger } from '../utils/logger.js';

import type { ApiResponse, Manifest } from "@artify/shared";

const UpdateManifestSchema = z.object({
  content: z.string().optional(),
});
type UpdateManifestBody = z.infer<typeof UpdateManifestSchema>;

const CreateManifestSchema = z.object({
  content: z.string().min(1, "Manifest content is required"),
});

type CreateManifestBody = z.infer<typeof CreateManifestSchema>;

const UpdateUserManifestSchema = z.object({
  content: z.string().optional(),
});
type UpdateUserManifestBody = z.infer<typeof UpdateUserManifestSchema>;

export const createManifestRouter = () => {
  const router = Router();

  // Get current user's manifest (create if doesn't exist)
  router.get("/", (req: Request, res: Response) => {
    try {
      const userId = req.user?.id || "demo-user"; // Get user ID from JWT
      logger.info("Fetching user's manifest", { userId });

      const manifest = ManifestModel.findByUserId(userId); // Get the first (should be only one)

      if (!manifest) {
        res.status(404).json({
          success: false,
          error: "Manifest not found for user",
        });
        return;
      }

      const response: ApiResponse<Manifest> = {
        success: true,
        data: manifest,
      };

      res.json(response);
    } catch (error) {
      logger.error("Error fetching user's manifest", error as Error);
      res
        .status(500)
        .json({ success: false, error: "Failed to fetch manifest" });
    }
  });

  // Update current user's manifest
  router.put<
    Record<string, never>,
    ApiResponse<Manifest>,
    UpdateUserManifestBody
  >("/", (req, res) => {
    try {
      const userId = req.user?.id || "demo-user";

      const result = UpdateUserManifestSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: "Invalid body: " + result.error.message,
        });
      }

      const { content } = req.body;

      logger.info("Updating user's manifest", { userId });

      // Find existing manifest for this user
      let manifest = ManifestModel.findByUserId(userId);

      // If no manifest exists, create one
      if (!manifest) {
        manifest = ManifestModel.create({
          content: content || "",
          userId,
        });
      } else {
        // Update existing manifest
        const updates: Partial<Manifest> = {};
        if (content !== undefined) updates.content = content;

        manifest = ManifestModel.update(manifest.id, updates)!;
      }

      logger.info("User's manifest updated successfully", {
        manifestId: manifest.id,
      });

      const response: ApiResponse<Manifest> = {
        success: true,
        data: manifest,
      };

      res.json(response);
    } catch (error) {
      logger.error("Error updating user's manifest", error as Error);
      res
        .status(500)
        .json({ success: false, error: "Failed to update manifest" });
    }
  });

  // Get all manifests
  router.get("/", (_req: Request, res: Response) => {
    logger.info("Fetching all manifests");
    const manifests = ManifestModel.findAll();
    const response: ApiResponse<Manifest[]> = {
      success: true,
      data: manifests,
    };
    res.json(response);
  });

  // Get single manifest by ID
  router.get("/:id", (req: Request, res: Response) => {
    try {
      const manifest = ManifestModel.findById(req.params.id);
      if (!manifest) {
        return res
          .status(404)
          .json({ success: false, error: "Manifest not found" });
      }
      res.json({ success: true, data: manifest });
    } catch (error) {
      logger.error("Error fetching manifest", error as Error);
      res
        .status(500)
        .json({ success: false, error: "Failed to fetch manifest" });
    }
  });

  // Get paintings using a specific manifest
  router.get("/:id/paintings", (req: Request, res: Response) => {
    try {
      const manifest = ManifestModel.findById(req.params.id);
      if (!manifest) {
        return res
          .status(404)
          .json({ success: false, error: "Manifest not found" });
      }

      const paintings = PaintingModel.findAll().filter(
        (p) => p.manifestId === req.params.id
      );

      res.json({ success: true, data: paintings });
    } catch (error) {
      logger.error("Error fetching paintings for manifest", error as Error);
      res
        .status(500)
        .json({ success: false, error: "Failed to fetch paintings" });
    }
  });

  // Create new manifest
  router.post<Record<string, never>, ApiResponse<Manifest>, CreateManifestBody>(
    "/",
    (req, res) => {
      try {
        const result = CreateManifestSchema.safeParse(req.body);
        if (!result.success) {
          return res.status(400).json({
            success: false,
            error: "Invalid body: " + result.error.message,
          });
        }

        const { content } = result.data;

        logger.info("Creating new manifest");

        const manifest = ManifestModel.create({
          content,
          userId: "demo-user", // TODO: Use actual user from session
        });

        logger.info("Manifest created successfully", {
          manifestId: manifest.id,
        });

        const response: ApiResponse<Manifest> = {
          success: true,
          data: manifest,
        };

        res.status(201).json(response);
      } catch (error) {
        logger.error("Failed to create manifest", error as Error);
        res.status(500).json({
          success: false,
          error: "Failed to create manifest",
        });
      }
    }
  );

  // Update manifest by ID
  router.patch<{ id: string }, ApiResponse<Manifest>, UpdateManifestBody>(
    "/:id",
    (req, res) => {
      try {
        const result = UpdateManifestSchema.safeParse(req.body);
        if (!result.success) {
          return res.status(400).json({
            success: false,
            error: "Invalid body:" + result.error.message,
          });
        }

        const manifest = ManifestModel.findById(req.params.id);
        if (!manifest) {
          return res
            .status(404)
            .json({ success: false, error: "Manifest not found" });
        }

        const { content } = result.data;

        const updates: Partial<Manifest> = {};
        if (content !== undefined) updates.content = content;

        const updatedManifest = ManifestModel.update(req.params.id, updates);

        logger.info("Manifest updated successfully", {
          manifestId: manifest.id,
          updates,
        });

        res.json({ success: true, data: updatedManifest! });
      } catch (error) {
        logger.error("Error updating manifest", error as Error);
        res
          .status(500)
          .json({ success: false, error: "Failed to update manifest" });
      }
    }
  );

  // Delete manifest by ID
  router.delete("/:id", (req: Request, res: Response) => {
    try {
      const manifest = ManifestModel.findById(req.params.id);
      if (!manifest) {
        return res
          .status(404)
          .json({ success: false, error: "Manifest not found" });
      }

      // Check if any paintings are using this manifest
      const paintingsUsingManifest = PaintingModel.findAll().filter(
        (p) => p.manifestId === req.params.id
      );

      if (paintingsUsingManifest.length > 0) {
        return res.status(400).json({
          success: false,
          error: `Cannot delete manifest: ${paintingsUsingManifest.length} painting(s) are using it`,
          data: { count: paintingsUsingManifest.length },
        });
      }

      const deleted = ManifestModel.delete(req.params.id);

      if (!deleted) {
        return res
          .status(404)
          .json({ success: false, error: "Manifest not found" });
      }

      logger.info("Manifest deleted successfully", {
        manifestId: req.params.id,
      });

      res.json({ success: true, data: { id: req.params.id } });
    } catch (error) {
      logger.error("Error deleting manifest", error as Error);
      res
        .status(500)
        .json({ success: false, error: "Failed to delete manifest" });
    }
  });

  return router;
};
