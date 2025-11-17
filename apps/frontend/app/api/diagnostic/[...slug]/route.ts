import { API_URL } from "@/config";
import { proxyRequest } from "@/lib/backendClient";

export async function all(
  request: Request,
  context: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await context.params;
  const path = slug?.join("/") ?? "";
  return await proxyRequest(request, `${API_URL}/diagnostic/${path}`);
}

export {
  all as GET,
  all as POST,
  all as PUT,
  all as PATCH,
  all as DELETE,
  all as OPTIONS,
};
