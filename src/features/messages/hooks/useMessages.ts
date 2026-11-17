"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { onMessageUpdated, onNewMessage } from "../api";
import { messageKeys, messageQueries } from "../queries";
import type { Message } from "../types";

export function useMessages(conversationId: string) {
  const queryClient = useQueryClient();
  const query = useQuery(messageQueries.list(conversationId));

  useEffect(() => {
    const unsubNew = onNewMessage((message) => {
      if (message.conversationId !== conversationId) return;

      queryClient.setQueryData<Message[]>(
        messageKeys.list(conversationId),
        (old = []) => {
          // our own optimistic message arrives again from the server; replace it
          if (old.some((m) => m.id === message.id)) {
            return old.map((m) => (m.id === message.id ? message : m));
          }
          return [...old, message];
        },
      );
    });

    const unsubUpdated = onMessageUpdated((message) => {
      if (message.conversationId !== conversationId) return;

      queryClient.setQueryData<Message[]>(
        messageKeys.list(conversationId),
        (old = []) => old.map((m) => (m.id === message.id ? message : m)),
      );
    });

    return () => {
      unsubNew();
      unsubUpdated();
    };
  }, [conversationId, queryClient]);

  return query;
}
