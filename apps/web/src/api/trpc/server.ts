import "server-only";

import { QueryClient } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import type { AppRouter } from "@repo/api/router";

const API_URL = process.env.API_URL ?? "http://localhost:3001";
const API_KEY = process.env.API_KEY;

const serverTrpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${API_URL}/trpc`,
      ...(API_KEY ? { headers: { "x-api-key": API_KEY } } : {}),
    }),
  ],
});

export const getServerQueryClient = () =>
  new QueryClient({
    defaultOptions: { queries: { staleTime: 60 * 1000 } },
  });

export const serverTrpc = createTRPCOptionsProxy<AppRouter>({
  client: serverTrpcClient,
  queryClient: getServerQueryClient,
});
