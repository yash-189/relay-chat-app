"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect, useRef } from "react";
import {
  markAsRead,
  onMessageUpdated,
  onNewMessage,
  onPresenceChange,
} from "../api";
import { conversationKeys, conversationQueries } from "../queries";
import type { Conversation } from "../types";
import {
  applyIncomingMessage,
  applyPresenceChange,
  applyUpdatedMessage,
} from "../utils";
import { useMarkAsRead } from "./useMarkAsRead";

// loads the list and keeps it live: new messages and online status update the cache
export function useConversations() {
  const queryClient = useQueryClient();
  const query = useQuery(conversationQueries.list());
  const params = useParams();
  const openChatId = typeof params?.id === "string" ? params.id : undefined;

  // ref so the subscription reads the open chat without resubscribing on every route change
  const openChatIdRef = useRef(openChatId);
  openChatIdRef.current = openChatId;

  useMarkAsRead(openChatId);

  useEffect(() => {
    const unsubMessage = onNewMessage((message) => {
      const activeId = openChatIdRef.current;
      if (activeId === message.conversationId) {
        // keep the server in sync, otherwise a refetch brings the badge back
        markAsRead(message.conversationId);
      }

      queryClient.setQueryData<Conversation[]>(
        conversationKeys.lists(),
        (old) => {
          if (!old) return old;
          return applyIncomingMessage(old, message, activeId);
        },
      );
    });

    const unsubUpdated = onMessageUpdated((message) => {
      queryClient.setQueryData<Conversation[]>(
        conversationKeys.lists(),
        (old) => {
          if (!old) return old;
          return applyUpdatedMessage(old, message);
        },
      );
    });

    const unsubPresence = onPresenceChange((event) => {
      queryClient.setQueryData<Conversation[]>(
        conversationKeys.lists(),
        (old) => {
          if (!old) return old;
          return applyPresenceChange(old, event.userId, event.isOnline);
        },
      );
    });

    return () => {
      unsubMessage();
      unsubUpdated();
      unsubPresence();
    };
  }, [queryClient]);

  return query;
}
