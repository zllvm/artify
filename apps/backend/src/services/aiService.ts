export interface ChatCompletionParams<TMessage = unknown> {
  model: string;
  messages: Array<TMessage>;
}

export interface ChatCompletionResult<TResult = unknown> {
  text: string;
  raw?: TResult;
}

export interface AIClient<TMessage = unknown, TResult = unknown> {
  chat: {
    complete: (
      params: ChatCompletionParams<TMessage>
    ) => Promise<ChatCompletionResult<TResult>>;
  };
}

export abstract class AiService<TMessage = unknown, TResult = unknown> {
  protected openai: AIClient<TMessage, TResult>;

  constructor(openai: AIClient<TMessage, TResult>) {
    this.openai = openai;
  }

  abstract describePainting(params: {
    imageBase64: string;
    manifestContent?: string;
  }): Promise<string>;
}
