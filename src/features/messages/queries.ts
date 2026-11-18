import { infiniteQueryOptions } from "@tanstack/react-query";
import { getMessages } from "./api";

const PAGE_SIZE = 50;

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
        getMessages(conversationId, pageParam, PAGE_SIZE),
      initialPageParam: null as string | null,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      staleTime: 60_000,
    }),
};
