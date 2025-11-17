import { proxyRequest } from "@/lib/backendClient";

export async function all(
  request: Request,
  { params }: { params: { slug: string[] } }
) {
  const path = params.slug?.join("/") ?? "";
  return await proxyRequest(request, `${process.env.API_URL}/${path}`);
}

export {
  all as GET,
  all as POST,
  all as PUT,
  all as PATCH,
  all as DELETE,
  all as OPTIONS,
};
