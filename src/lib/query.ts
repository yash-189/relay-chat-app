import { isServer, MutationCache, QueryClient } from "@tanstack/react-query";
import { cache } from "react";
import { toast } from "sonner";

const STALE_MS = 60_000;

function makeQueryClient() {
  return new QueryClient({
    // Avoids refetching server-prefetched data right after hydration.
    defaultOptions: { queries: { staleTime: STALE_MS } },
    // Failed reads are shown by the screen, failed writes as a toast.
    mutationCache: new MutationCache({
      onError: (error) => toast.error(error.message),
    }),
  });
}

// One client per server request, shared by every server component in it,
// so users never share a cache.
const getServerQueryClient = cache(makeQueryClient);

let browserClient: QueryClient | undefined;

export function getQueryClient() {
  if (isServer) return getServerQueryClient();
  browserClient ??= makeQueryClient();
  return browserClient;
}
