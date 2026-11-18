"use client";

import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { onMessageUpdated, onNewMessage } from "../api";
import { flattenPages, updateCachedMessages } from "../cache";
import { messageQueries } from "../queries";

export function useMessages(conversationId: string) {
  const queryClient = useQueryClient();
  const query = useInfiniteQuery({
    ...messageQueries.list(conversationId),
    select: flattenPages,
  });

  useEffect(() => {
    const unsubNew = onNewMessage((message) => {
      if (message.conversationId !== conversationId) return;

      updateCachedMessages(queryClient, conversationId, (old = []) => {
        // our own optimistic message arrives again from the server; replace it
        if (old.some((m) => m.id === message.id)) {
          return old.map((m) => (m.id === message.id ? message : m));
        }
        return [...old, message];
      });
    });

    const unsubUpdated = onMessageUpdated((message) => {
      if (message.conversationId !== conversationId) return;

      updateCachedMessages(queryClient, conversationId, (old = []) =>
        old.map((m) => (m.id === message.id ? message : m)),
      );
    });

    return () => {
      unsubNew();
      unsubUpdated();
    };
  }, [conversationId, queryClient]);

  return query;
}
