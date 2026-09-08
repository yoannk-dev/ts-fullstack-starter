import type { NextRequest } from "next/server";

const API_URL = process.env.API_URL ?? "http://localhost:3001";
const API_KEY = process.env.API_KEY;

/**
 * Same-origin proxy in front of the NestJS tRPC endpoint.
 *
 * apps/web is entirely client-rendered, so the browser would otherwise call the
 * API directly and would have to carry the shared API key itself — which means
 * shipping it in client JS, visible to anyone via devtools. Routing through this
 * server-side handler keeps API_KEY out of the browser: it's attached here, on
 * the server, from a non-NEXT_PUBLIC_ env var.
 */
async function proxy(request: NextRequest): Promise<Response> {
  const url = new URL(request.url);
  const targetPath = url.pathname.replace(/^\/api\/trpc/, "/trpc");
  const targetUrl = `${API_URL}${targetPath}${url.search}`;

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("content-length");
  if (API_KEY) {
    headers.set("x-api-key", API_KEY);
  }

  const hasBody = request.method !== "GET" && request.method !== "HEAD";

  const response = await fetch(
    targetUrl,
    hasBody
      ? { method: request.method, headers, body: await request.arrayBuffer() }
      : { method: request.method, headers },
  );

  const responseHeaders = new Headers(response.headers);
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("content-length");

  return new Response(response.body, {
    status: response.status,
    headers: responseHeaders,
  });
}

export { proxy as GET, proxy as POST };
