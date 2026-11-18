"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CURRENT_USER_ID, sendMessage } from "../api";
import { messageKeys } from "../queries";
import type { Message, SendMessageInput } from "../types";

export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (input: SendMessageInput) => sendMessage(input),
    onMutate: async (input: SendMessageInput) => {
      await queryClient.cancelQueries({
        queryKey: messageKeys.list(conversationId),
      });

      const optimisticMessage: Message = {
        id: input.id,
        conversationId: input.conversationId,
        senderId: CURRENT_USER_ID,
        text: input.text,
        createdAt: new Date().toISOString(),
        status: "sending",
        replyToId: input.replyToId,
        attachment: input.attachment,
      };

      queryClient.setQueryData<Message[]>(
        messageKeys.list(conversationId),
        (old = []) => {
          // a retry reuses the failed message's id, so replace instead of append
          if (old.some((m) => m.id === input.id)) {
            return old.map((m) => (m.id === input.id ? optimisticMessage : m));
          }
          return [...old, optimisticMessage];
        },
      );
    },
    onError: (_err, input) => {
      // keep the message as failed instead of dropping it, so it can be retried
      queryClient.setQueryData<Message[]>(
        messageKeys.list(conversationId),
        (old = []) =>
          old.map((m) => (m.id === input.id ? { ...m, status: "failed" } : m)),
      );
    },
    onSuccess: (savedMessage) => {
      queryClient.setQueryData<Message[]>(
        messageKeys.list(conversationId),
        (old = []) =>
          old.map((m) => (m.id === savedMessage.id ? savedMessage : m)),
      );
    },
  });

  return mutation;
}
