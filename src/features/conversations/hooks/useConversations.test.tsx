import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import type { Message } from "@/features/messages";
import { chatEmitter } from "@/mocks";
import * as api from "../api";
import { useConversations } from "./useConversations";

let mockParams: { id?: string } = {};

vi.mock("next/navigation", () => ({
  useParams: () => mockParams,
  usePathname: () => (mockParams.id ? `/chats/${mockParams.id}` : "/"),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
        staleTime: 60_000,
        gcTime: Number.POSITIVE_INFINITY,
      },
    },
  });
  return {
    queryClient,
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  };
}

describe("useConversations hook live events", () => {
  it("subscribes to message:new and updates cache", async () => {
    mockParams = { id: undefined };
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useConversations(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.data?.length).toBeGreaterThan(0);
    });

    const initialConversations = result.current.data ?? [];
    const secondConv = initialConversations[1];
    const initialUnread = secondConv.unreadCount;

    const incoming: Message = {
      id: "test-new-msg",
      conversationId: secondConv.id,
      senderId: "user-2",
      text: "Real-time incoming message via event emitter",
      createdAt: new Date().toISOString(),
      status: "delivered",
    };

    act(() => {
      chatEmitter.emit("message:new", incoming);
    });

    await waitFor(() => {
      const currentList = result.current.data ?? [];
      expect(currentList[0].id).toBe(secondConv.id);
      expect(currentList[0].lastMessage?.text).toBe(
        "Real-time incoming message via event emitter",
      );
      expect(currentList[0].unreadCount).toBe(initialUnread + 1);
    });
  });

  it("calls markAsRead for open chat when incoming message arrives", async () => {
    mockParams = { id: "conv-1" };
    const markAsReadSpy = vi.spyOn(api, "markAsRead");
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useConversations(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.data?.length).toBeGreaterThan(0);
    });

    markAsReadSpy.mockClear();

    const incoming: Message = {
      id: "test-open-chat-msg",
      conversationId: "conv-1",
      senderId: "user-2",
      text: "Message sent directly to the open chat",
      createdAt: new Date().toISOString(),
      status: "delivered",
    };

    act(() => {
      chatEmitter.emit("message:new", incoming);
    });

    await waitFor(() => {
      expect(markAsReadSpy).toHaveBeenCalledWith("conv-1");
      const currentList = result.current.data ?? [];
      const conv1 = currentList.find((c) => c.id === "conv-1");
      expect(conv1?.unreadCount).toBe(0);
    });

    markAsReadSpy.mockRestore();
  });

  it("subscribes to presence:change and updates presence", async () => {
    mockParams = { id: undefined };
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useConversations(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.data?.length).toBeGreaterThan(0);
    });

    act(() => {
      chatEmitter.emit("presence:change", {
        userId: "user-2",
        isOnline: false,
      });
    });

    await waitFor(() => {
      const user2Conv = (result.current.data ?? []).find(
        (c) => c.participantIds.includes("user-2") && c.type === "direct",
      );
      expect(user2Conv?.isOnline).toBe(false);
    });
  });
});
