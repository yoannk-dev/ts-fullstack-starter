"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCContext } from "@trpc/tanstack-react-query";
import type { AppRouter } from "@repo/api/router";

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();

const makeQueryClient = () =>
  new QueryClient({
    defaultOptions: { queries: { staleTime: 60 * 1000 } },
  });

let browserQueryClient: QueryClient | undefined;

const getQueryClient = () => {
  if (typeof window === "undefined") return makeQueryClient();
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
};

export const Providers = ({ children }: { children: React.ReactNode }) => {
  const queryClient = getQueryClient();
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          // Same-origin: proxied server-side by app/api/trpc/[...trpc]/route.ts,
          // which attaches the API key. Never call the API directly from here —
          // that would require shipping the key to the browser.
          url: "/api/trpc",
        }),
      ],
    }),
  );

  return (
    <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </TRPCProvider>
  );
};
