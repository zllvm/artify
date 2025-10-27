import type { Request, Response } from "express";
import { Router } from 'express';

import config from '../config/environment.js';
import { getPaintingById } from '../repositories/paintingRepository.js';

const router = Router();

router.get("/share/:id", (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const painting = getPaintingById(id);

    if (!painting) {
      return res.status(404).json({ error: "Painting not found" });
    }

    const metadata = {
      title: painting.title || "Untitled",
      description: painting.description || "Check out this amazing artwork!",
      imageUrl: painting.imageUrl,
      shareUrl: `${config.baseUrl}/api/facebook/share/${id}`,
      viewUrl: `${config.baseUrl}/painting/${id}`,
      backendHost: `${req.protocol}://${req.get("host")}`,
    };

    const html = `<!DOCTYPE html>
<html>
  <head>
    <meta property="og:title" content="${metadata.title}" />
    <meta property="og:description" content="A minion image." />
    <meta property="og:image" content="${metadata.backendHost}${metadata.imageUrl}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${metadata.viewUrl}" />
    <meta charset="utf-8" />
  </head>
</html>`;
    //<script>window.location.replace("/painting/${id}");</script>
    res.setHeader("Content-Type", "text/html");
    res.send(html);
  } catch (error) {
    console.error("Error fetching painting metadata:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
// <script>window.location.replace("/viewer/${id}");</script>
