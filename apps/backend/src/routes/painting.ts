import type { Request, Response } from "express";
import { Router } from 'express';

import { getPaintingById } from '../repositories/paintingRepository.js';

const router = Router();

router.get("/:id", (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const painting = getPaintingById(id);

    if (!painting) {
      return res.status(404).send("<h1>Painting not found</h1>");
    }

    const baseUrl = `https://${req.get("host")}`;
    const paintingUrl = `${baseUrl}/api/painting/${id}`;
    const imageUrl = painting.imageUrl.startsWith("http")
      ? painting.imageUrl
      : `${baseUrl}${painting.imageUrl}`;

    const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${painting.title || "Untitled"} - Artify</title>
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${paintingUrl}" />
    <meta property="og:title" content="${painting.title || "Untitled"}" />
    <meta property="og:description" content="${
      painting.description ||
      "Check out this amazing artwork created with Artify!"
    }" />
    <meta property="og:image" content="${imageUrl}" />
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${paintingUrl}" />
    <meta name="twitter:title" content="${painting.title || "Untitled"}" />
    <meta name="twitter:description" content="${
      painting.description ||
      "Check out this amazing artwork created with Artify!"
    }" />
    <meta name="twitter:image" content="${imageUrl}" />
    
    <style>
      body {
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        background: #f5f5f5;
      }
      .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 40px 20px;
      }
      .painting-card {
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        overflow: hidden;
      }
      .painting-image {
        width: 100%;
        height: auto;
        display: block;
      }
      .painting-info {
        padding: 30px;
      }
      .painting-title {
        font-size: 2rem;
        margin: 0 0 15px 0;
        color: #333;
      }
      .painting-description {
        font-size: 1.1rem;
        line-height: 1.6;
        color: #666;
        margin: 0;
      }
      .logo {
        text-align: center;
        margin-bottom: 30px;
        color: #555;
        font-size: 1.5rem;
        font-weight: bold;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="logo">🎨 Artify</div>
      <div class="painting-card">
        <img src="${imageUrl}" alt="${
          painting.title || "Painting"
        }" class="painting-image" />
        <div class="painting-info">
          <h1 class="painting-title">${painting.title || "Untitled"}</h1>
          <p class="painting-description">${
            painting.description || "No description available."
          }</p>
        </div>
      </div>
    </div>
  </body>
</html>`;

    res.setHeader("Content-Type", "text/html");
    res.send(html);
  } catch (error) {
    console.error("Error fetching painting:", error);
    res.status(500).send("<h1>Internal server error</h1>");
  }
});

export default router;
