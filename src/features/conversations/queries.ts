import { queryOptions } from "@tanstack/react-query";
import { getConversations } from "./api";

export const conversationKeys = {
  all: ["conversations"] as const,
  lists: () => [...conversationKeys.all, "list"] as const,
};

export const conversationQueries = {
  list: () =>
    queryOptions({
      queryKey: conversationKeys.lists(),
      queryFn: () => getConversations(),
      staleTime: 60_000,
    }),
};
