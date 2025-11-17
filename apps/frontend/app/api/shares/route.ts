import { API_URL } from "@/config";
import { proxyRequest } from "@/lib/backendClient";

export async function all(request: Request) {
  return await proxyRequest(request, `${API_URL}/shares`);
}

export { all as GET };
