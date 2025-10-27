export interface Painting {
  id: string;
  title?: string;
  description?: string;
  tags?: string[];
  imageUrl: string;
  manifestId?: string; // Reference to user's manifest
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface Share {
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
}

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

export enum Platform {
  Artify = "artify",
  Pinterest = "pinterest",
  Facebook = "facebook",
  Instagram = "instagram",
}

export interface IUser {
  id: string;
  email: string;
  displayName: string;
  token?: string;
}

export interface CreateShareRequest {
  paintingId: string;
  userId: string;
  alias?: string;
  description?: string;
  tags?: string[];
  platform: Platform;
  isPublished?: boolean;
}
