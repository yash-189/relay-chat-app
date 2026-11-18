"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleReaction as apiToggleReaction, CURRENT_USER_ID } from "../api";
import { updateCachedMessages } from "../cache";
import { messageKeys } from "../queries";
import { toggleReaction } from "../utils";

export function useToggleReaction(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId, emoji }: { messageId: string; emoji: string }) =>
      apiToggleReaction(messageId, emoji),
    onMutate: async ({ messageId, emoji }) => {
      await queryClient.cancelQueries({
        queryKey: messageKeys.list(conversationId),
      });

      const previous = queryClient.getQueryData(
        messageKeys.list(conversationId),
      );

      updateCachedMessages(queryClient, conversationId, (old = []) =>
        old.map((m) =>
          m.id === messageId
            ? {
                ...m,
                reactions: toggleReaction(m.reactions, emoji, CURRENT_USER_ID),
              }
            : m,
        ),
      );

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          messageKeys.list(conversationId),
          context.previous,
        );
      }
    },
    onSuccess: (saved) => {
      if (!saved) return;
      updateCachedMessages(queryClient, conversationId, (old = []) =>
        old.map((m) => (m.id === saved.id ? saved : m)),
      );
    },
  });
}
