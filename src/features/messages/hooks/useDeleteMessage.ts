"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteMessage } from "../api";
import { messageKeys } from "../queries";
import type { Message } from "../types";

export function useDeleteMessage(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteMessage(id),
    onMutate: async (id) => {
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
      queryClient.setQueryData<Message[]>(
        messageKeys.list(conversationId),
        (old = []) => old.map((m) => (m.id === saved.id ? saved : m)),
      );
    },
  });
}
