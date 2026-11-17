"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { markAsRead } from "../api";
import { conversationKeys } from "../queries";
import type { Conversation } from "../types";

// clears the unread badge as soon as a chat opens, rolls back if the call fails
export function useMarkAsRead(conversationId?: string | null) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => markAsRead(id),
    onMutate: async (id: string) => {
      if (queryClient.getQueryData(conversationKeys.lists())) {
        await queryClient.cancelQueries({ queryKey: conversationKeys.lists() });
      }

      const previous = queryClient.getQueryData<Conversation[]>(
        conversationKeys.lists(),
      );

      queryClient.setQueryData<Conversation[]>(
        conversationKeys.lists(),
        (old) => {
          if (!old) return old;
          return old.map((conv) =>
            conv.id === id ? { ...conv, unreadCount: 0 } : conv,
          );
        },
      );

      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(conversationKeys.lists(), context.previous);
      }
    },
  });

  // mutate changes identity each render; a ref keeps the effect tied to the chat id only
  const mutateRef = useRef(mutation.mutate);
  mutateRef.current = mutation.mutate;

  useEffect(() => {
    if (conversationId) {
      mutateRef.current(conversationId);
    }
  }, [conversationId]);

  return mutation;
}
