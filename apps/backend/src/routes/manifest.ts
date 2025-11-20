import { Request, Response, Router } from "express";
import { z } from "zod";

import { ManifestModel } from "../models/manifest.js";
import { PaintingModel } from "../models/painting.js";
import { logger } from "../utils/logger/logger.js";

import type { RequestHandler } from "express";
import type { ApiResponse, Manifest } from "@artify/shared";

const UpdateManifestSchema = z.object({
  content: z.string().optional(),
});

const CreateManifestSchema = z.object({
  content: z.string().min(1, "Manifest content is required"),
});

const UpdateUserManifestSchema = z.object({
  content: z.string().optional(),
});

export const createManifestRouter = (requireAuth: RequestHandler) => {
  const router = Router();

  // Get current user's manifest (create if doesn't exist)
  router.get("/", requireAuth, (req: Request, res: Response) => {
    const user = req.user;

    if (!user) {
      return res.status(401).send("Unauthorized");
    }

    try {
      logger.info("Fetching user's manifest", { userId: user.id });

      const manifest = ManifestModel.findByUserId(user.id);

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
  router.put("/", requireAuth, (req, res) => {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).send("Unauthorized");
      }

      const result = UpdateUserManifestSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: "Invalid body: " + result.error.message,
        });
      }

      const { content } = result.data;

      logger.info("Updating user's manifest", { userId: user.id });

      // Find existing manifest for this user
      let manifest = ManifestModel.findByUserId(user.id);

      // If no manifest exists, create one
      if (!manifest) {
        manifest = ManifestModel.create({
          content: content || "",
          userId: user.id,
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

  router.get("/", requireAuth, (req: Request, res: Response) => {
    const user = req.user;

    if (!user || !user.isAdmin) {
      return res.status(401).send("Unauthorized");
    }

    logger.info("Fetching all manifests");
    const manifests = ManifestModel.findAll();
    const response: ApiResponse<Manifest[]> = {
      success: true,
      data: manifests,
    };
    res.json(response);
  });

  router.get("/:id", requireAuth, (req: Request, res: Response) => {
    const user = req.user;

    if (!user || !user.isAdmin) {
      return res.status(401).send("Unauthorized");
    }

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

  router.get("/:id/paintings", requireAuth, (req: Request, res: Response) => {
    const user = req.user;

    if (!user) {
      return res.status(401).send("Unauthorized");
    }

    try {
      const manifest = ManifestModel.findById(req.params.id);
      if (!manifest) {
        return res
          .status(404)
          .json({ success: false, error: "Manifest not found" });
      }

      if (manifest.userId !== user.id) {
        return res.status(403).json({ success: false, error: "Forbidden" });
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
  router.post("/", requireAuth, (req, res) => {
    const user = req.user;

    if (!user) {
      return res.status(401).send("Unauthorized");
    }

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
        userId: user.id,
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
  });

  router.patch("/:id", requireAuth, (req, res) => {
    const user = req.user;

    if (!user) {
      return res.status(401).send("Unauthorized");
    }

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

      if (manifest.userId !== user.id) {
        return res.status(403).json({ success: false, error: "Forbidden" });
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
  });

  router.delete("/:id", requireAuth, (req: Request, res: Response) => {
    const user = req.user;

    if (!user) {
      return res.status(401).send("Unauthorized");
    }

    try {
      const manifest = ManifestModel.findById(req.params.id);
      if (!manifest) {
        return res
          .status(404)
          .json({ success: false, error: "Manifest not found" });
      }

      if (manifest.userId !== user.id) {
        return res.status(403).json({ success: false, error: "Forbidden" });
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
