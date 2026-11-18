"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteMessage } from "../api";
import { updateCachedMessages } from "../cache";
import { messageKeys } from "../queries";

export function useDeleteMessage(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteMessage(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({
        queryKey: messageKeys.list(conversationId),
      });

      const previous = queryClient.getQueryData(
        messageKeys.list(conversationId),
      );

      updateCachedMessages(queryClient, conversationId, (old = []) =>
        old.map((m) =>
          m.id === id
            ? {
                ...m,
                deletedAt: new Date().toISOString(),
                text: "",
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
