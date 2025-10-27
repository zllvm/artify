export type AnyFile =
  | {
      type?: string;
      name?: string;
      size?: number;
    }
  | null
  | undefined;
