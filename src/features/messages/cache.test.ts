import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import { getCachedMessages, updateCachedMessages } from "./cache";
import { messageKeys } from "./queries";
import type { Message } from "./types";

const message = (id: string): Message => ({
  id,
  conversationId: "conv-1",
  senderId: "user-1",
  text: id,
  createdAt: "2026-11-01T10:00:00.000Z",
  status: "read",
});

function seed() {
  const queryClient = new QueryClient();
  queryClient.setQueryData(messageKeys.list("conv-1"), {
    pages: [
      { messages: [message("c"), message("d")], nextCursor: "c" },
      { messages: [message("a"), message("b")], nextCursor: null },
    ],
    pageParams: [null, "c"],
  });
  return queryClient;
}

describe("message cache", () => {
  it("reads pages oldest first", () => {
    const ids = getCachedMessages(seed(), "conv-1").map((m) => m.id);
    expect(ids).toEqual(["a", "b", "c", "d"]);
  });

  it("appends new messages to the newest page and keeps older pages intact", () => {
    const queryClient = seed();
    updateCachedMessages(queryClient, "conv-1", (old) => [
      ...old,
      message("e"),
    ]);

    const data = queryClient.getQueryData<{
      pages: { messages: Message[] }[];
    }>(messageKeys.list("conv-1"));
    expect(data?.pages[0].messages.map((m) => m.id)).toEqual(["c", "d", "e"]);
    expect(data?.pages[1].messages.map((m) => m.id)).toEqual(["a", "b"]);
  });

  it("updates a message on an older page in place", () => {
    const queryClient = seed();
    updateCachedMessages(queryClient, "conv-1", (old) =>
      old.map((m) => (m.id === "a" ? { ...m, text: "edited" } : m)),
    );

    expect(getCachedMessages(queryClient, "conv-1")[0].text).toBe("edited");
  });
});
