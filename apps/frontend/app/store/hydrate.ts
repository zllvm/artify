export const HYDRATE = "HYDRATE" as const;

export type HydrateAction<T> = {
  type: typeof HYDRATE;
  payload: T;
};
