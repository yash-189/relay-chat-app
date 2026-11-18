import { infiniteQueryOptions } from "@tanstack/react-query";
import { getMessages } from "./api";
import type { MessageCursor } from "./types";

const PAGE_SIZE = 50;
const STALE_TIME_MS = 60_000;

export const messageKeys = {
  all: ["messages"] as const,
  lists: () => [...messageKeys.all, "list"] as const,
  list: (conversationId: string) =>
    [...messageKeys.lists(), conversationId] as const,
};

export const messageQueries = {
  list: (conversationId: string) =>
    infiniteQueryOptions({
      queryKey: messageKeys.list(conversationId),
      queryFn: ({ pageParam }) =>
        getMessages(conversationId, { before: pageParam, limit: PAGE_SIZE }),
      initialPageParam: null as MessageCursor,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      staleTime: STALE_TIME_MS,
    }),
};
