export const MAX_IMAGE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

export interface Painting {
  id: string;
  title?: string;
  description?: string;
  tags?: string[];
  images: {
    thumbnail: string;
    web: string;
    original: string;
  };
  manifestId?: string; // Reference to user's manifest
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface ArtifyLink {
  shareId: string;
  url: string;
}

export interface Share<T> {
  id: string;
  paintingId: string;
  userId: string;
  alias?: string;
  description?: string;
  tags?: string[];
  platform: Platform;
  isPublished: boolean;
  publishDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  metadata?: T;
  title?: string;
  images: {
    thumbnail?: string;
    web?: string;
    original: string;
  };
  artify?: ArtifyLink;
}

export interface PinterestMetadata {
  boardId?: string;
  pinId?: string;
}

export interface MetadataMap {
  [Platform.Artify]: never;
  [Platform.Pinterest]: PinterestMetadata;
  [Platform.Facebook]: { postId: string };
  [Platform.Instagram]: { reelId: string };
}

export type ShareFor<P extends Platform> = Share<MetadataMap[P]>;
export type AnyShare = Share<MetadataMap[keyof MetadataMap]>;

export type ArtifyShare = ShareFor<Platform.Artify>;
export type PinterestShare = ShareFor<Platform.Pinterest>;
export type FacebookShare = ShareFor<Platform.Facebook>;

export interface Manifest {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface GeneratedContent {
  title: string;
  description: string;
  tags: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ApiToken {
  token: string;
  expireAt: Date;
}

export enum Platform {
  Artify = "artify",
  Pinterest = "pinterest",
  Facebook = "facebook",
  Instagram = "instagram",
}

export interface IUserDto {
  id: string;
  email: string;
  name: string;
  displayName?: string;
  isAuthenticated: boolean;
  tokenExpiresAt?: string;
  isPinterestConnected: boolean;
  role: "admin" | "artist" | "viewer";
}

export interface CreatePinterestShareRequest {
  paintingId: string;
  userId: string;
  alias?: string;
  description?: string;
  tags?: string[];
  platform: Platform;
  isPublished?: boolean;
  boardId: string;
  linkedShareId?: string;
}

export type UpdatePinterestShareRequest = Partial<CreatePinterestShareRequest>;

export interface PinterestBoard {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface PinterestBoardsResponse {
  items: PinterestBoard[];
  bookmark?: string;
}

export interface AppJwtPayload {
  iss?: string;
  sub?: string;
  aud?: string | string[];
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
  email: string;
  name: string;
  [key: string]: unknown;
}
