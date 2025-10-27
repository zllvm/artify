import axios from "axios";

export interface PublishResponse {
  id: string;
}

export async function publishToInstagram(
  accessToken: string,
  igUserId: string,
  imageUrl: string,
  caption?: string
): Promise<PublishResponse> {
  const containerRes = await axios.post<{ id: string }>(
    `https://graph.facebook.com/v21.0/${igUserId}/media`,
    {
      image_url: imageUrl,
      caption,
    },
    { params: { access_token: accessToken } }
  );

  const publishRes = await axios.post<PublishResponse>(
    `https://graph.facebook.com/v21.0/${igUserId}/media_publish`,
    { creation_id: containerRes.data.id },
    { params: { access_token: accessToken } }
  );

  return publishRes.data;
}
