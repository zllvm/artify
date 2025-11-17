import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import { API_URL } from "@/config";
import { proxyBackend } from "@/lib/backendClient";
import { PinterestShare, UpdatePinterestShareRequest } from "@artify/shared";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const shareId = params.id;

  const body = (await req.json()) as UpdatePinterestShareRequest;
  const json = await proxyBackend<PinterestShare>(
    `${API_URL}/pinterest/share/${shareId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: req.headers.get("cookie") ?? "",
      },
      body: JSON.stringify(body),
    }
  );
  revalidateTag(`share-${shareId}`);

  return NextResponse.json(json.data);
}
