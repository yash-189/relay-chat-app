import { beforeEach, describe, expect, it } from "vitest";
import { useChatStore } from "./chat.store";

describe("chat store", () => {
  beforeEach(() => {
    useChatStore.setState({
      drafts: {},
      replyTo: {},
      editingId: {},
      isSearchOpen: false,
    });
  });

  it("stores and clears drafts per conversation", () => {
    useChatStore.getState().setDraft("conv-1", "Draft for conv 1");
    useChatStore.getState().setDraft("conv-2", "Draft for conv 2");

    expect(useChatStore.getState().drafts["conv-1"]).toBe("Draft for conv 1");
    expect(useChatStore.getState().drafts["conv-2"]).toBe("Draft for conv 2");

    useChatStore.getState().clearDraft("conv-1");
    expect(useChatStore.getState().drafts["conv-1"]).toBeUndefined();
    expect(useChatStore.getState().drafts["conv-2"]).toBe("Draft for conv 2");
  });

  it("sets and clears reply target per conversation", () => {
    useChatStore.getState().setReplyToId("conv-1", "msg-123");
    expect(useChatStore.getState().replyTo["conv-1"]).toBe("msg-123");

    useChatStore.getState().setReplyToId("conv-1", null);
    expect(useChatStore.getState().replyTo["conv-1"]).toBeNull();
  });

  it("sets and clears editing target per conversation", () => {
    useChatStore.getState().setEditingId("conv-1", "msg-456");
    expect(useChatStore.getState().editingId["conv-1"]).toBe("msg-456");

    useChatStore.getState().setEditingId("conv-1", null);
    expect(useChatStore.getState().editingId["conv-1"]).toBeNull();
  });

  it("toggles and sets message search open state", () => {
    expect(useChatStore.getState().isSearchOpen).toBe(false);

    useChatStore.getState().toggleSearch();
    expect(useChatStore.getState().isSearchOpen).toBe(true);

    useChatStore.getState().setSearchOpen(false);
    expect(useChatStore.getState().isSearchOpen).toBe(false);
  });
});
