"use client";

import { useQuery } from "@tanstack/react-query";
import { conversationQueries } from "../queries";

// reads one conversation from the list cache. useConversations keeps that
// cache live, so this hook must not subscribe to events itself.
export function useConversation(conversationId: string) {
  return useQuery({
    ...conversationQueries.list(),
    select: (conversations) =>
      conversations.find((c) => c.id === conversationId) ?? null,
  });
}
