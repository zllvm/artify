import { Request, RequestHandler, Response, Router } from "express";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { z } from "zod";

import { formatBytes, MAX_IMAGE_SIZE_BYTES } from "@artify/shared";
import {
  detectImageFormat,
  getFilenameFromUrl,
} from "@artify/shared/utils/imageUtils";

import { ManifestModel } from "../models/manifest.js";
import { PaintingModel } from "../models/painting.js";
import { ShareModel } from "../models/share.js";
import { ChatGptService } from "../services/chatGptService.js";
import { ImageService } from "../services/imageService.js";
import { logger } from "../utils/logger/logger.js";
import { upload, UPLOADS_DIR } from "../utils/multer.js";

import type { ApiResponse, Painting } from "@artify/shared";

export const uploadBodySchema = z.object({
  imageUrl: z.url().optional(),
  manifestId: z.uuid().optional(),
});

export type UploadBody = z.infer<typeof uploadBodySchema>;

export const PaintingSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  imageUrl: z.string(),
  manifestId: z.string().optional(),
  userId: z.string(),
  tags: z.array(z.string()).optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

// For query parameters (?title=true&tags=false)
export const DescribeQuerySchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  tags: z.string().optional(),
  maxLength: z.coerce.number().max(1000).optional(),
});

// For request body (JSON)
export const DescribeBodySchema = z.object({
  title: z.boolean().optional(),
  description: z.boolean().optional(),
  tags: z.boolean().optional(),
  maxLength: z.coerce.number().max(1000).optional(),
});

export type DescribeQuery = z.infer<typeof DescribeQuerySchema>;
export type DescribeBody = z.infer<typeof DescribeBodySchema>;

const UpdatePaintingSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// type UpdatePaintingBody = z.infer<typeof UpdatePaintingSchema>;

export const createPaintingRouter = (
  requireAuth: RequestHandler,
  chatGptService: ChatGptService
) => {
  const router = Router();

  router.get("/", requireAuth, (req: Request, res: Response) => {
    const user = req.user;

    if (!user) {
      return res.status(401).send("Unauthorized");
    }

    logger.info("Fetching all paintings");
    const paintings = PaintingModel.findByUserId(user.id);
    const response: ApiResponse<Painting[]> = {
      success: true,
      data: paintings,
    };
    res.json(response);
  });

  router.get("/:id", requireAuth, (req: Request, res: Response) => {
    const user = req.user;

    if (!user) {
      return res.status(401).send("Unauthorized");
    }

    try {
      const painting = PaintingModel.findById(req.params.id);

      if (!painting) {
        return res
          .status(404)
          .json({ success: false, error: "Painting not found" });
      }

      if (painting.userId !== user.id) {
        return res.status(403).json({ success: false, error: "Forbidden" });
      }

      return res.json({ success: true, data: painting });
    } catch (error) {
      logger.error("Error fetching painting", error as Error);
      return res
        .status(500)
        .json({ success: false, error: "Failed to fetch painting" });
    }
  });

  router.post(
    "/upload",
    requireAuth,
    upload.single("image"),
    async (req, res: Response) => {
      try {
        const user = req.user;

        if (!user) {
          return res.status(401).send("Unauthorized");
        }

        const parsed = uploadBodySchema.parse(req.body);
        const { imageUrl: providedUrl, manifestId } = parsed;

        let buffer: Buffer;
        // ---------------------------------------------------------
        // CASE 1: IMAGE URL
        // ---------------------------------------------------------
        if (providedUrl) {
          logger.info("Uploading painting via URL", { providedUrl });

          buffer = await downloadWithLimit(providedUrl);

          const meta = await sharp(buffer).metadata();
          if (!meta.format) {
            return res.status(400).json({
              success: false,
              error: "Invalid image provided via URL",
            });
          }
        }
        // ---------------------------------------------------------
        // CASE 2: FILE UPLOAD
        // ---------------------------------------------------------
        else {
          if (!req.file) {
            return res.status(400).json({
              success: false,
              error: "No image file or URL provided",
            });
          }

          logger.info("Uploading painting via file", {
            originalName: req.file.originalname,
            size: req.file.size,
          });

          buffer =
            req.file.buffer ??
            (await fs.promises.readFile(
              path.join(UPLOADS_DIR, req.file.filename)
            ));
        }

        // ---------------------------------------------------------
        // PROCESS IMAGE (master, web, thumbnail)
        // ---------------------------------------------------------
        const variants = await ImageService.processPainting(buffer);

        const painting = PaintingModel.create({
          images: {
            original: variants.master.url,
            web: variants.web.url,
            thumbnail: variants.thumbnail.url,
          },
          manifestId: manifestId || undefined,
          userId: user.id,
        });

        logger.info("Painting stored", {
          paintingId: painting.id,
          sizes: {
            masterKB: Math.round(variants.master.size / 1024),
            webKB: Math.round(variants.web.size / 1024),
            thumbKB: Math.round(variants.thumbnail.size / 1024),
          },
        });

        return res.status(201).json({
          success: true,
          data: painting,
        } satisfies ApiResponse<Painting>);
      } catch (error) {
        logger.error("Failed to upload painting", error as Error);
        res.status(500).json({
          success: false,
          error: "Failed to upload painting",
        });
      }
    }
  );

  router.post("/:id/describe", requireAuth, async (req, res) => {
    const user = req.user;

    if (!user) {
      return res.status(401).send("Unauthorized");
    }

    try {
      const params = req.params as { id: string };
      const body = req.body as DescribeBody;
      const query = req.query as DescribeQuery;

      const queryResult = DescribeQuerySchema.safeParse(req.query);
      if (!queryResult.success) {
        const bodyResult = DescribeBodySchema.safeParse(req.body);
        if (!bodyResult.success) {
          return res.status(400).json({
            success: false,
            error: "Invalid parameters",
          });
        }
      }

      // 1. Find painting
      const painting = PaintingModel.findById(params.id);
      if (!painting) {
        return res.status(404).json({
          success: false,
          data: { id: params.id },
          error: "Painting not found",
        } as ApiResponse<Painting>);
      }

      if (painting.userId !== user.id) {
        return res.status(403).json({
          success: false,
          data: { id: params.id },
          error: "Forbidden",
        } as ApiResponse<Painting>);
      }

      // 2. Get manifest content
      let manifestContent = "";
      if (painting.manifestId) {
        const manifest = ManifestModel.findById(painting.manifestId);
        if (manifest) manifestContent = manifest.content;
      }

      // 3. Check image file
      const filePath = path.join(process.cwd(), painting.images.original);
      if (!fs.existsSync(filePath)) {
        logger.warn("Image file not found on disk", {
          imageUrl: painting.images.web,
        });
        return res.status(400).json({
          success: false,
          data: { id: painting.id },
          error: "Image file not found on server",
        } as ApiResponse<Painting>);
      }

      // 4. Prepare AI input
      logger.info("Generating AI output for painting", {
        paintingId: painting.id,
      });
      const imageBase64 = fs.readFileSync(filePath).toString("base64");

      // 5. Parse query params
      const wantTitle = query?.title === "true" || body?.title === true;
      const wantDescription =
        query?.description === "true" ||
        body?.description === true ||
        (!wantTitle && query?.tags !== "true" && body?.tags !== true);
      const wantTags = query?.tags === "true" || body?.tags === true;
      const maxLength = query?.maxLength ?? body?.maxLength ?? null;

      // 6. Build response data
      const result: ApiResponse<Painting>["data"] = {
        id: painting.id,
        images: painting.images,
        manifestId: painting.manifestId,
        userId: painting.userId,
        tags: painting.tags,
        createdAt: painting.createdAt,
        updatedAt: painting.updatedAt,
      };
      if (wantDescription) {
        result.description = await chatGptService.describePainting({
          imageBase64,
          manifestContent,
          limit: maxLength,
        });
      }
      if (wantTitle) {
        result.title = await chatGptService.suggestTitle({
          imageBase64,
          manifestContent,
        });
      }
      if (wantTags) {
        result.tags = await chatGptService.suggestTags({
          imageBase64,
          manifestContent,
        });
      }

      // 7. Return response
      return res.json({
        success: true,
        data: result,
      } as ApiResponse<Painting>);
    } catch (error) {
      logger.error("Error generating AI output", error as Error);
      return res.status(500).json({
        success: false,
        data: { id: req.params.id },
        error: "Failed to generate AI output",
      } as ApiResponse<Painting>);
    }
  });

  // Get manifest for a specific painting
  // router.get("/:id/manifest", requireAuth, (req: Request, res: Response) => {
  //   try {
  //     const painting = PaintingModel.findById(req.params.id);
  //     if (!painting) {
  //       return res
  //         .status(404)
  //         .json({ success: false, error: "Painting not found" });
  //     }

  //     if (!painting.manifestId) {
  //       return res
  //         .status(404)
  //         .json({ success: false, error: "Painting has no manifest" });
  //     }

  //     const manifest = ManifestModel.findById(painting.manifestId);
  //     if (!manifest) {
  //       return res
  //         .status(404)
  //         .json({ success: false, error: "Manifest not found" });
  //     }

  //     res.json({ success: true, data: manifest });
  //   } catch (error) {
  //     logger.error("Error fetching manifest for painting", error as Error);
  //     res
  //       .status(500)
  //       .json({ success: false, error: "Failed to fetch manifest" });
  //   }
  // });

  // Update painting by ID
  router.patch("/:id", requireAuth, (req, res) => {
    const user = req.user;

    if (!user) {
      return res.status(401).send("Unauthorized");
    }

    try {
      const result = UpdatePaintingSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: "Invalid body: " + result.error.message,
        });
      }

      const painting = PaintingModel.findById(req.params.id);

      if (!painting) {
        return res
          .status(404)
          .json({ success: false, error: "Painting not found" });
      }

      if (painting.userId !== user.id) {
        return res.status(403).json({ success: false, error: "Forbidden" });
      }

      const { title, description, tags } = result.data;

      // Update only provided fields
      if (title !== undefined) painting.title = title;
      if (description !== undefined) painting.description = description;
      if (tags !== undefined) painting.tags = tags;

      painting.updatedAt = new Date();

      const shares = ShareModel.findByPaintingId(req.params.id);

      for (const share of shares) {
        share.updatedAt = new Date();
        share.title = painting.title;
      }

      logger.info("Painting updated successfully", {
        paintingId: painting.id,
        updates: { title, description, tags },
      });

      res.json({ success: true, data: painting });
    } catch (error) {
      logger.error("Error updating painting", error as Error);
      res
        .status(500)
        .json({ success: false, error: "Failed to update painting" });
    }
  });

  router.get("/proxy/image", requireAuth, async (req, res) => {
    const user = req.user;

    if (!user) {
      return res.status(401).send("Unauthorized");
    }

    const imageUrl = req.query.url as string;
    if (!imageUrl || !imageUrl.startsWith("http")) {
      return res.status(400).json({ error: "Invalid image URL" });
    }

    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        return res
          .status(response.status)
          .json({ error: "Failed to fetch image" });
      }

      const buffer = Buffer.from(await response.arrayBuffer());

      const metadata = await sharp(buffer).metadata();
      const thumbnail = await sharp(buffer)
        .resize({ width: 300, fit: "inside" })
        .jpeg({ quality: 75 })
        .toBuffer();

      const filename = getFilenameFromUrl(imageUrl);
      const originalFormat = detectImageFormat({
        contentType: response.headers.get("content-type") || undefined,
        sharpFormat: metadata.format,
        url: imageUrl,
      });
      const size = formatBytes(buffer.byteLength);

      const outputFormat = "jpeg";
      const base64 = `data:image/${outputFormat};base64,${thumbnail.toString(
        "base64"
      )}`;

      res.json({
        filename,
        originalFormat,
        outputFormat: outputFormat.toUpperCase(),
        size,
        width: metadata.width,
        height: metadata.height,
        image: base64,
      });
    } catch (err) {
      console.error("Proxy error:", err);
      res.status(500).json({ error: "Failed to load image" });
    }
  });

  return router;
};

async function downloadWithLimit(url: string): Promise<Buffer> {
  const controller = new AbortController();
  const response = await fetch(url, { signal: controller.signal });

  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status}`);
  }

  const reader: ReadableStreamDefaultReader<Uint8Array> | undefined =
    response.body?.getReader();

  if (!reader) throw new Error("No readable body stream");

  const chunks: Buffer[] = [];
  let total = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;

    total += value.length;
    if (total > MAX_IMAGE_SIZE_BYTES) {
      controller.abort(); // cancel request immediately
      throw new Error("Image exceeds maximum allowed size (10 MB)");
    }

    chunks.push(Buffer.from(value));
  }

  return Buffer.concat(chunks);
}
