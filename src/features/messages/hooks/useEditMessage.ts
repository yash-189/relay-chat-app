"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { editMessage } from "../api";
import { messageKeys } from "../queries";
import type { Message } from "../types";

export function useEditMessage(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) =>
      editMessage(id, text),
    onMutate: async ({ id, text }) => {
      await queryClient.cancelQueries({
        queryKey: messageKeys.list(conversationId),
      });

      const previous = queryClient.getQueryData<Message[]>(
        messageKeys.list(conversationId),
      );

      queryClient.setQueryData<Message[]>(
        messageKeys.list(conversationId),
        (old = []) =>
          old.map((m) =>
            m.id === id
              ? { ...m, text, editedAt: new Date().toISOString() }
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
      queryClient.setQueryData<Message[]>(
        messageKeys.list(conversationId),
        (old = []) => old.map((m) => (m.id === saved.id ? saved : m)),
      );
    },
  });
}
