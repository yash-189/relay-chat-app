import { queryOptions } from "@tanstack/react-query";
import { getMessages, getUsers } from "./api";

export const messageKeys = {
  all: ["messages"] as const,
  lists: () => [...messageKeys.all, "list"] as const,
  list: (conversationId: string) =>
    [...messageKeys.lists(), conversationId] as const,
  users: () => ["users"] as const,
};

export const messageQueries = {
  list: (conversationId: string) =>
    queryOptions({
      queryKey: messageKeys.list(conversationId),
      queryFn: () => getMessages(conversationId),
      staleTime: 60_000,
    }),
  users: () =>
    queryOptions({
      queryKey: messageKeys.users(),
      queryFn: () => getUsers(),
      staleTime: 60_000,
    }),
};
