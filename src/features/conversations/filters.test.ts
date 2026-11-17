import { describe, expect, it } from "vitest";
import type { Message } from "@/features/messages";
import { filterConversations } from "./filters";
import type { Conversation } from "./types";

const mockMessage = (text: string): Message => ({
  id: "msg-1",
  conversationId: "conv-1",
  senderId: "user-2",
  text,
  createdAt: "2026-11-17T12:00:00.000Z",
  status: "delivered",
});

const sampleConversations: Conversation[] = [
  {
    id: "conv-1",
    type: "direct",
    name: "Sarah Chen",
    avatarUrl: "https://example.com/sarah.jpg",
    participantIds: ["user-me", "user-2"],
    lastMessage: mockMessage("Review the pull request please"),
    unreadCount: 2,
    isOnline: true,
  },
  {
    id: "conv-2",
    type: "group",
    name: "Frontend Architecture",
    avatarUrl: "https://example.com/frontend.jpg",
    participantIds: ["user-me", "user-2", "user-3"],
    lastMessage: mockMessage("Let's discuss React server components"),
    unreadCount: 0,
  },
  {
    id: "conv-3",
    type: "direct",
    name: "Marcus Johnson",
    avatarUrl: "https://example.com/marcus.jpg",
    participantIds: ["user-me", "user-3"],
    lastMessage: mockMessage("Sounds good, talk soon"),
    unreadCount: 0,
    isOnline: false,
  },
  {
    id: "conv-4",
    type: "group",
    name: "Design Team",
    avatarUrl: "https://example.com/design.jpg",
    participantIds: ["user-me", "user-4"],
    lastMessage: mockMessage("New mockups are in Figma"),
    unreadCount: 5,
  },
];

describe("filterConversations", () => {
  describe("search", () => {
    it("matches conversation name case-insensitively", () => {
      const results = filterConversations(sampleConversations, "sarah", "all");
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe("conv-1");
    });

    it("matches last message text case-insensitively", () => {
      const results = filterConversations(sampleConversations, "figma", "all");
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe("conv-4");
    });

    it("returns all conversations when query is empty or whitespace", () => {
      expect(filterConversations(sampleConversations, "", "all")).toHaveLength(
        4,
      );
      expect(
        filterConversations(sampleConversations, "   ", "all"),
      ).toHaveLength(4);
    });

    it("returns empty array when search query matches nothing", () => {
      const results = filterConversations(
        sampleConversations,
        "nonexistent query",
        "all",
      );
      expect(results).toHaveLength(0);
    });
  });

  describe("filters", () => {
    it("returns all conversations with filter 'all'", () => {
      const results = filterConversations(sampleConversations, "", "all");
      expect(results).toHaveLength(4);
    });

    it("returns only conversations with unreadCount > 0 with filter 'unread'", () => {
      const results = filterConversations(sampleConversations, "", "unread");
      expect(results).toHaveLength(2);
      expect(results.map((c) => c.id)).toEqual(["conv-1", "conv-4"]);
    });

    it("returns only group conversations with filter 'groups'", () => {
      const results = filterConversations(sampleConversations, "", "groups");
      expect(results).toHaveLength(2);
      expect(results.map((c) => c.id)).toEqual(["conv-2", "conv-4"]);
    });
  });

  describe("search and filter together", () => {
    it("filters unread conversations matching a query", () => {
      const results = filterConversations(
        sampleConversations,
        "figma",
        "unread",
      );
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe("conv-4");
    });

    it("excludes non-unread even if search matches", () => {
      const results = filterConversations(
        sampleConversations,
        "server",
        "unread",
      );
      expect(results).toHaveLength(0);
    });

    it("filters groups matching a query", () => {
      const results = filterConversations(
        sampleConversations,
        "Frontend",
        "groups",
      );
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe("conv-2");
    });

    it("excludes direct chats even if query matches when groups filter is active", () => {
      const results = filterConversations(
        sampleConversations,
        "Sarah",
        "groups",
      );
      expect(results).toHaveLength(0);
    });
  });
});
