import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { conversationKeys } from "../queries";
import type { Conversation } from "../types";
import { useMarkAsRead } from "./useMarkAsRead";

describe("useMarkAsRead", () => {
  it("optimistically sets unreadCount to 0 for the specified conversation", async () => {
    const queryClient = new QueryClient();
    const initialList: Conversation[] = [
      {
        id: "conv-1",
        type: "direct",
        name: "Sarah Chen",
        avatarUrl: "",
        participantIds: ["user-me", "user-2"],
        lastMessage: null,
        unreadCount: 4,
      },
    ];

    queryClient.setQueryData(conversationKeys.lists(), initialList);

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    renderHook(() => useMarkAsRead("conv-1"), { wrapper });

    await waitFor(() => {
      const cached = queryClient.getQueryData<Conversation[]>(
        conversationKeys.lists(),
      );
      expect(cached?.[0].unreadCount).toBe(0);
    });
  });
});
