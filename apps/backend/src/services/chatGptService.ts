import { AIClient, AiService, ChatCompletionParams, ChatCompletionResult } from './aiService.js';

import type OpenAI from "openai";
interface DescribePaintingParams {
  imageBase64: string;
  manifestContent?: string;
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
    { imageBase64, manifestContent }: DescribePaintingParams,
    prompt: string
  ): Promise<string> {
    const result = await this.openai.chat.complete({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `${prompt} ${
                manifestContent ? `Manifest: ${manifestContent}` : ""
              }`,
            },
            {
              type: "image_url",
              image_url: { url: `data:image/png;base64,${imageBase64}` },
            },
          ],
        },
      ],
    });
    return result.text;
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
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
  }
}
