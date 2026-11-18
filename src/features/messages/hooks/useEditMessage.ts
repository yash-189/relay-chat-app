"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { editMessage } from "../api";
import { updateCachedMessages } from "../cache";
import { messageKeys } from "../queries";

export function useEditMessage(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) =>
      editMessage(id, text),
    onMutate: async ({ id, text }) => {
      await queryClient.cancelQueries({
        queryKey: messageKeys.list(conversationId),
      });

      const previous = queryClient.getQueryData(
        messageKeys.list(conversationId),
      );

      updateCachedMessages(queryClient, conversationId, (old = []) =>
        old.map((m) =>
          m.id === id ? { ...m, text, editedAt: new Date().toISOString() } : m,
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
