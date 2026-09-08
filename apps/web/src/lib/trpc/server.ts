import "server-only";

import { QueryClient } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import type { AppRouter } from "@repo/api/router";

const API_URL = process.env.API_URL ?? "http://localhost:3001";
const API_KEY = process.env.API_KEY;

/**
 * Server Components can call the API directly (no proxy needed — this code
 * never reaches the browser) using the same server-only API_KEY as
 * app/api/trpc/[...trpc]/route.ts.
 */
const serverTrpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${API_URL}/trpc`,
      ...(API_KEY ? { headers: { "x-api-key": API_KEY } } : {}),
    }),
  ],
});

/**
 * One QueryClient per request — Server Components run per-request, so this
 * must not be a shared singleton like the browser's getQueryClient().
 */
export const getServerQueryClient = () =>
  new QueryClient({
    defaultOptions: { queries: { staleTime: 60 * 1000 } },
  });

/**
 * Same shape as useTRPC() but usable outside React context, for prefetching
 * in async Server Components. Produces the same query keys as the client
 * proxy (key generation only depends on procedure path + input), so
 * queryClient.prefetchQuery(serverTrpc.todo.findAll.queryOptions()) hydrates
 * straight into the client-side useQuery(trpc.todo.findAll.queryOptions()).
 */
export const serverTrpc = createTRPCOptionsProxy<AppRouter>({
  client: serverTrpcClient,
  queryClient: getServerQueryClient,
});
