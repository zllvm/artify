import { Request, Response, Router } from "express";
import { z } from "zod";

import {
  AnyShare,
  ApiResponse,
  PinterestBoardsResponse,
  PinterestShare,
  Platform,
} from "@artify/shared";

import config from "../config/environment.js";
import { PaintingModel } from "../models/painting.js";
import { ShareModel } from "../models/share.js";
import { UserRepository } from "../repositories/userRepository.js";
import { logger } from "../utils/logger/logger.js";

import type { RequestHandler } from "express";
interface PinterestTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in?: number;
  refresh_token?: string;
  user_id?: string;
}

interface OrigPinterestBoard {
  id: string;
  name: string;
  description?: string;
  privacy: "PUBLIC" | "PROTECTED" | "SECRET";
  media?: {
    image_cover_url?: string;
    image_thumbnail_url?: string;
  };
  owner: {
    username: string;
    id: string;
  };
  created_at: string;
}

interface OrigPinterestBoardsResponse {
  items: OrigPinterestBoard[];
  bookmark?: string;
}

export const createShareSchema = z.object({
  paintingId: z.string(),
  userId: z.string(),
  alias: z.string().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  platform: z.enum(Platform),
  isPublished: z.boolean().optional(),
  boardId: z.string(),
  linkedShareId: z.string().optional(),
});

export type CreateShareRequest = z.infer<typeof createShareSchema>;
const updateShareSchema = createShareSchema.partial();

export interface PinterestImageVariant {
  url: string;
  width: number;
  height: number;
}

export interface PinterestPinMedia {
  media_type: "image" | "video";
  images?: {
    "150x150"?: PinterestImageVariant;
    "400x300"?: PinterestImageVariant;
    "600x"?: PinterestImageVariant;
    original?: PinterestImageVariant;
  };
}

export interface PinterestCreatePinResponse {
  id: string;
  link: string;
  title?: string;
  description?: string;
  dominant_color?: string;
  alt_text?: string;
  board_id: string;
  media: PinterestPinMedia;
  created_at: string;
}

export const createPinterestRouter = (
  requireAuth: RequestHandler,
  userRepo: UserRepository
) => {
  const router = Router();

  router.get("/login", requireAuth, (req, res) => {
    if (!req.user) {
      return res.status(401).send("Unauthorized");
    }

    const returnTo = req.query.returnTo ?? "/settings";
    const stateObj = { userId: req.user.id, returnTo };
    const state = encodeURIComponent(JSON.stringify(stateObj));

    const redirectUri = encodeURIComponent(config.pinterest.redirectUri);
    const clientId = config.pinterest.clientId;

    const scope = encodeURIComponent(
      "pins:read,pins:write,boards:read,boards:write"
    );
    const authUrl = `https://www.pinterest.com/oauth/?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${state}`;

    res.redirect(authUrl);
  });

  router.get("/callback", async (req, res) => {
    const { code, state } = req.query;
    if (!code) return res.status(400).send("Missing code");
    if (!state) return res.status(400).send("Missing state");

    const parsedState = JSON.parse(decodeURIComponent(state as string)) as {
      userId: string;
      returnTo: string;
    };
    const { userId, returnTo } = parsedState;

    const user = userRepo.get(userId);
    if (!user) return res.status(404).send("User not found");

    const credentials = Buffer.from(
      `${config.pinterest.clientId}:${config.pinterest.clientSecret}`
    ).toString("base64");

    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code: code as string,
      redirect_uri: config.pinterest.redirectUri,
    });

    const tokenResponse = await fetch(
      `${config.pinterest.tokenUrl}/v5/oauth/token`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      }
    );

    const tokenData = (await tokenResponse.json()) as PinterestTokenResponse;

    if (!tokenResponse.ok) {
      console.error("Token error:", tokenData);
      return res.status(400).json(tokenData);
    }

    user.connectPinterest(tokenData.access_token);

    res.redirect(`${config.app.frontendUrl}/${returnTo}?connected=pinterest`);
  });

  router.delete("/disconnect", requireAuth, (req, res) => {
    const user = req.user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    user.disconnectPinterest();

    res.json({ success: true });
  });

  router.get("/boards", requireAuth, async (req, res) => {
    const user = req.user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    if (!user.pinterestToken)
      return res.status(400).json({ error: "Pinterest not connected" });

    const response = await fetch(
      `${config.pinterest.tokenUrl}/v5/boards?privacy=ALL`,
      {
        headers: {
          Authorization: `Bearer ${user.pinterestToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    const data = (await response.json()) as OrigPinterestBoardsResponse;

    if (!response.ok) return res.status(400).json(data);

    const boardsResponse: PinterestBoardsResponse = {
      items: data.items.map((board) => ({
        id: board.id,
        name: board.name,
        description: board.description,
        created_at: board.created_at,
      })),
      bookmark: data.bookmark,
    };

    res.json({ success: true, data: boardsResponse });
  });

  router.post(
    "/share",
    requireAuth,
    async (
      req: Request<unknown, unknown, CreateShareRequest>,
      res: Response
    ) => {
      const user = req.user;
      if (!user) return res.status(401).json({ error: "Unauthorized" });

      if (!user.pinterestToken)
        return res.status(400).json({ error: "Pinterest not connected" });

      const parsed = createShareSchema.parse(req.body);

      const painting = PaintingModel.findById(parsed.paintingId);

      if (!painting)
        return res.status(404).json({ error: "Painting not found" });

      let artifyLink;
      if (parsed.linkedShareId) {
        artifyLink = {
          shareId: parsed.linkedShareId,
          url: `${config.app.frontendUrl}/art/${parsed.linkedShareId}`,
        };
      }

      const share = ShareModel.create<Platform.Pinterest>({
        paintingId: parsed.paintingId,
        userId: parsed.userId,
        alias: parsed.alias,
        description: parsed.description,
        tags: parsed.tags,
        platform: parsed.platform,
        isPublished: parsed.isPublished ?? false,
        title: painting.title,
        images: painting.images,
        metadata: { boardId: parsed.boardId },
        artify: artifyLink,
      });

      if (parsed.isPublished) {
        const descriptionWithTags =
          `${share.description ?? ""}${share.tags && share.tags.length ? "\n" : ""}${share.tags?.map((tag) => `#${tag}`).join(" ") ?? ""}`.trim();

        const response = await fetch(`${config.pinterest.tokenUrl}/v5/pins`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${user.pinterestToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            board_id: parsed.boardId,
            title: painting.title,
            description: descriptionWithTags,
            link: share.artify?.url ?? "",
            media_source: {
              source_type: "image_url",
              url: `${config.app.baseUrl}/backend/${painting.images.original}`,
            },
          }),
        });

        const data = (await response.json()) as PinterestCreatePinResponse;
        if (!response.ok) return res.status(400).json(data);

        share.metadata!.pinId = data.id;
      }

      const apiResponse: ApiResponse<AnyShare> = {
        success: true,
        data: share,
      };

      res.json(apiResponse);
    }
  );

  // update share
  router.patch("/share/:id", requireAuth, (req, res) => {
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

      logger.info("Share updated", { shareId: share.id });
      res.json({ success: true, data: share });
    } catch (err) {
      logger.error("Error updating share", err as Error);
      res.status(500).json({ success: false, error: "Failed to update share" });
    }
  });

  router.post(
    "/share/:id/publish",
    requireAuth,
    async (req: Request, res: Response) => {
      const user = req.user;
      if (!user) return res.status(401).json({ error: "Unauthorized" });

      if (!user.pinterestToken)
        return res.status(400).json({ error: "Pinterest not connected" });

      const existingShare = ShareModel.findById(
        req.params.id,
        Platform.Pinterest
      );
      if (!existingShare) {
        return res
          .status(404)
          .json({ success: false, error: "Share not found" });
      }

      if (existingShare.isPublished) {
        return res
          .status(400)
          .json({ success: false, error: "Share already published" });
      }

      const descriptionWithTags =
        `${existingShare.description ?? ""}${existingShare.tags && existingShare.tags.length ? "\n" : ""}${existingShare.tags?.map((tag) => `#${tag}`).join(" ") ?? ""}`.trim();

      const response = await fetch(`${config.pinterest.tokenUrl}/v5/pins`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.pinterestToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          board_id: existingShare.metadata!.boardId,
          title: existingShare.title,
          description: descriptionWithTags,
          link: existingShare.artify?.url ?? "",
          media_source: {
            source_type: "image_url",
            url: `${config.app.baseUrl}/backend/${existingShare.images.original}`,
          },
        }),
      });

      const data = (await response.json()) as PinterestCreatePinResponse;
      if (!response.ok) return res.status(400).json(data);

      const share = ShareModel.publish(existingShare.id) as PinterestShare;
      share.metadata!.pinId = data.id;

      const apiResponse: ApiResponse<AnyShare> = {
        success: true,
        data: share,
      };

      res.json(apiResponse);
    }
  );

  router.delete(
    "/share/:id",
    requireAuth,
    async (req: Request, res: Response) => {
      const user = req.user;
      if (!user) return res.status(401).json({ error: "Unauthorized" });
      if (!user.pinterestToken)
        return res.status(400).json({ error: "Pinterest not connected" });

      const { id } = req.params;
      const share = ShareModel.findById(id, Platform.Pinterest);
      if (!share) return res.status(404).json({ error: "Share not found" });

      const pinId = share.metadata?.pinId;
      if (pinId) {
        const response = await fetch(
          `${config.pinterest.tokenUrl}/v5/pins/${pinId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${user.pinterestToken}`,
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          return res.status(400).json(errorData);
        }
      }

      share.isPublished = false;
      share.publishDate = undefined;
      if (share.metadata) {
        delete share.metadata.pinId;
      }

      const apiResponse: ApiResponse<AnyShare> = {
        success: true,
        data: share,
      };

      res.json(apiResponse);
    }
  );

  return router;
};
