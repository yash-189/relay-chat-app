import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { failNextSendMessage } from "@/mocks";
import { messageKeys } from "../queries";
import type { Message } from "../types";
import { useSendMessage } from "./useSendMessage";

function createHookWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return { queryClient, wrapper };
}

describe("useSendMessage", () => {
  it("optimistically adds message with status sending and resolves to sent", async () => {
    const { queryClient, wrapper } = createHookWrapper();
    const { result } = renderHook(() => useSendMessage("conv-1"), { wrapper });

    const input = {
      id: "msg-test-1",
      conversationId: "conv-1",
      text: "Optimistic test message",
    };

    await act(async () => {
      result.current.mutate(input);
    });

    await waitFor(() => {
      const cached = queryClient.getQueryData<Message[]>(
        messageKeys.list("conv-1"),
      );
      expect(cached).toBeDefined();
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const cachedAfter = queryClient.getQueryData<Message[]>(
      messageKeys.list("conv-1"),
    );
    const saved = cachedAfter?.find((m) => m.id === "msg-test-1");
    expect(saved?.status).toBe("sent");
  });

  it("marks optimistic message as failed when server returns an error", async () => {
    failNextSendMessage();

    const { queryClient, wrapper } = createHookWrapper();
    const { result } = renderHook(() => useSendMessage("conv-1"), { wrapper });

    const input = {
      id: "msg-fail-test",
      conversationId: "conv-1",
      text: "This message will fail",
    };

    await act(async () => {
      result.current.mutate(input);
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    const cached = queryClient.getQueryData<Message[]>(
      messageKeys.list("conv-1"),
    );
    const failedMsg = cached?.find((m) => m.id === "msg-fail-test");
    expect(failedMsg?.status).toBe("failed");
  });
});
