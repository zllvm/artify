// import axios from "axios";
// import { Request, Response } from "express";

// import { publishToInstagram } from "../services/instagramService.js";

// export const createPost = async (req: Request, res: Response) => {
//   try {
//     const { imageUrl, caption } = req.body;

//     if (!imageUrl) {
//       return res.status(400).json({ error: "imageUrl is required" });
//     }

//     // TODO: load user token + igUserId from DB
//     const accessToken = "user_token";
//     const igUserId = "user_ig_id";

//     const result = await publishToInstagram(
//       accessToken,
//       igUserId,
//       imageUrl,
//       caption
//     );
//     res.json({ success: true, postId: result.id });
//   } catch (err: unknown) {
//     if (axios.isAxiosError(err)) {
//       console.error("Publish error:", err.response?.data || err.message);
//     } else if (err instanceof Error) {
//       console.error("Publish error:", err.message);
//     } else {
//       console.error("Publish error:", String(err));
//     }

//     res.status(500).json({ error: "Failed to publish post" });
//   }
// };
