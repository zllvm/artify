import { logger } from "../utils/logger/logger.js";
import {
  AIClient,
  AiService,
  ChatCompletionParams,
  ChatCompletionResult,
} from "./aiService.js";

import type OpenAI from "openai";
interface DescribePaintingParams {
  imageBase64: string;
  manifestContent?: string;
  limit?: number | null;
}

export class OpenAiClient
  implements AIClient<OpenAI.ChatCompletionMessageParam, OpenAI.ChatCompletion>
{
  constructor(private openai: OpenAI) {}

  chat = {
    complete: async (
      params: ChatCompletionParams<OpenAI.ChatCompletionMessageParam>
    ): Promise<ChatCompletionResult<OpenAI.ChatCompletion>> => {
      const response = await this.openai.chat.completions.create({
        model: params.model,
        messages: params.messages,
      });

      const text = response.choices[0]?.message?.content ?? "";
      return { text, raw: response };
    },
  };
}

export class ChatGptService extends AiService<
  OpenAI.ChatCompletionMessageParam,
  OpenAI.ChatCompletion
> {
  constructor(
    ai: AIClient<OpenAI.ChatCompletionMessageParam, OpenAI.ChatCompletion>
  ) {
    super(ai);
  }

  private async getPaintingCompletion(
    { imageBase64, manifestContent, limit }: DescribePaintingParams,
    prompt: string
  ): Promise<string> {
    const limitText = limit
      ? `Write a complete, natural description that does not exceed ${limit} characters. 
       If necessary, make it shorter, but never interrupt a sentence.`
      : "";

    const result = await this.openai.chat.complete({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a concise assistant. Always respond under the specified character limit, ending with a complete sentence.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `${prompt} ${
                manifestContent ? `Manifest: ${manifestContent}` : ""
              } ${limitText}`,
            },
            {
              type: "image_url",
              image_url: { url: `data:image/png;base64,${imageBase64}` },
            },
          ],
        },
      ],
    });

    let text = result.text.trim();
    if (limit && text.length > limit + 10) {
      logger.warn(
        `AI response exceeded limit (${text.length} > ${limit}). Truncating gracefully.`
      );
      const truncated = text.slice(0, limit);
      // try to end on the last full sentence
      const lastSentenceEnd = truncated.lastIndexOf(".");
      if (lastSentenceEnd > 0) text = truncated.slice(0, lastSentenceEnd + 1);
      else text = truncated;
    }
    return text;
  }

  async describePainting(params: DescribePaintingParams): Promise<string> {
    return this.getPaintingCompletion(
      params,
      "Describe this painting in detail."
    );
  }

  async suggestTitle(params: DescribePaintingParams): Promise<string> {
    const title = await this.getPaintingCompletion(
      params,
      "Suggest a creative, short title for this painting."
    );
    // Remove leading/trailing quotes (single or double)
    return title.replace(/^['"]|['"]$/g, "").trim();
  }

  async suggestTags(params: DescribePaintingParams): Promise<string[]> {
    const tagsString = await this.getPaintingCompletion(
      params,
      "Suggest 3-7 relevant, short tags for this painting as a comma-separated list."
    );
    return tagsString
      .split(",")
      .map((tag) =>
        tag
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "")
      )
      .filter((tag) => tag.length > 0);
  }
}
