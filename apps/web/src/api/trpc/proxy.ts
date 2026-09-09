import type { NextRequest } from "next/server";

const API_URL = process.env.API_URL ?? "http://localhost:3001";
const API_KEY = process.env.API_KEY;

export async function proxyTrpcRequest(request: NextRequest): Promise<Response> {
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
