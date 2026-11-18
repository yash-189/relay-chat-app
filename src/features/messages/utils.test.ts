import { describe, expect, it } from "vitest";
import type { Attachment, Message, MessageReaction } from "./types";
import {
  findLatestOwnMessage,
  formatAttachmentLabel,
  formatFileSize,
  formatMessageTime,
  formatTypingLabel,
  groupByDate,
  isNearBottom,
  searchMatchingMessageIds,
  toggleReaction,
} from "./utils";

const createMsg = (
  id: string,
  createdAt: string,
  overrides?: Partial<Message>,
): Message => ({
  id,
  conversationId: "conv-1",
  senderId: "user-me",
  text: `Message ${id}`,
  createdAt,
  status: "sent",
  ...overrides,
});

describe("messages utils", () => {
  describe("groupByDate", () => {
    it("groups today and yesterday correctly", () => {
      const now = new Date("2026-11-18T14:00:00");
      const todayMsg = createMsg("m1", "2026-11-18T10:00:00");
      const yesterdayMsg = createMsg("m2", "2026-11-17T18:00:00");

      const groups = groupByDate([yesterdayMsg, todayMsg], now);
      expect(groups).toHaveLength(2);
      expect(groups[0].date).toBe("Yesterday");
      expect(groups[1].date).toBe("Today");
    });

    it("handles month boundary correctly", () => {
      const now = new Date("2026-11-01T10:00:00");
      const lastMonthMsg = createMsg("m1", "2026-10-31T22:00:00");
      const todayMsg = createMsg("m2", "2026-11-01T08:00:00");

      const groups = groupByDate([lastMonthMsg, todayMsg], now);
      expect(groups).toHaveLength(2);
      expect(groups[0].date).toBe("Yesterday");
      expect(groups[1].date).toBe("Today");
    });

    it("handles year boundary correctly", () => {
      const now = new Date("2027-01-01T12:00:00");
      const newYearsEveMsg = createMsg("m1", "2026-12-31T23:30:00");
      const newYearMsg = createMsg("m2", "2027-01-01T09:00:00");

      const groups = groupByDate([newYearsEveMsg, newYearMsg], now);
      expect(groups).toHaveLength(2);
      expect(groups[0].date).toBe("Yesterday");
      expect(groups[1].date).toBe("Today");
    });

    it("formats older dates with month and day", () => {
      const now = new Date("2026-11-18T12:00:00");
      const olderMsg = createMsg("m1", "2026-11-10T12:00:00");

      const groups = groupByDate([olderMsg], now);
      expect(groups).toHaveLength(1);
      expect(groups[0].date).toBe("Nov 10");
    });
  });

  describe("isNearBottom", () => {
    it("returns true when within threshold", () => {
      expect(isNearBottom(820, 1000, 100, 100)).toBe(true);
      expect(isNearBottom(900, 1000, 100, 100)).toBe(true);
    });

    it("returns false when above threshold", () => {
      expect(isNearBottom(700, 1000, 100, 100)).toBe(false);
    });
  });

  describe("formatMessageTime", () => {
    it("formats valid ISO string to local time", () => {
      const formatted = formatMessageTime("2026-11-18T14:30:00.000Z");
      expect(formatted).toBeTruthy();
    });

    it("returns empty string on invalid date", () => {
      expect(formatMessageTime("not-a-date")).toBe("");
    });
  });

  describe("formatTypingLabel", () => {
    it("returns null when empty", () => {
      expect(formatTypingLabel([])).toBeNull();
    });

    it("formats single user typing", () => {
      expect(formatTypingLabel(["Sarah"])).toBe("Sarah is typing…");
    });

    it("formats two users typing", () => {
      expect(formatTypingLabel(["Sarah", "Alex"])).toBe(
        "Sarah and Alex are typing…",
      );
    });

    it("formats three or more users typing", () => {
      expect(formatTypingLabel(["Sarah", "Alex", "Jordan"])).toBe(
        "3 people are typing…",
      );
    });
  });

  describe("toggleReaction", () => {
    it("adds a new reaction when not present", () => {
      const initial: MessageReaction[] = [];
      const updated = toggleReaction(initial, "👍", "user-1");

      expect(updated).toEqual([{ emoji: "👍", userIds: ["user-1"] }]);
    });

    it("appends user to existing reaction", () => {
      const initial: MessageReaction[] = [{ emoji: "👍", userIds: ["user-1"] }];
      const updated = toggleReaction(initial, "👍", "user-2");

      expect(updated).toEqual([{ emoji: "👍", userIds: ["user-1", "user-2"] }]);
    });

    it("replaces the user's previous reaction with the new one", () => {
      const initial: MessageReaction[] = [
        { emoji: "👍", userIds: ["user-1", "user-2"] },
      ];
      const updated = toggleReaction(initial, "🔥", "user-2");

      expect(updated).toEqual([
        { emoji: "👍", userIds: ["user-1"] },
        { emoji: "🔥", userIds: ["user-2"] },
      ]);
    });

    it("removes user when user already reacted", () => {
      const initial: MessageReaction[] = [
        { emoji: "👍", userIds: ["user-1", "user-2"] },
      ];
      const updated = toggleReaction(initial, "👍", "user-2");

      expect(updated).toEqual([{ emoji: "👍", userIds: ["user-1"] }]);
    });

    it("removes reaction entirely when last user unreacts", () => {
      const initial: MessageReaction[] = [{ emoji: "👍", userIds: ["user-1"] }];
      const updated = toggleReaction(initial, "👍", "user-1");

      expect(updated).toEqual([]);
    });
  });

  describe("searchMatchingMessageIds", () => {
    it("finds matching message IDs and skips deleted messages", () => {
      const messages: Message[] = [
        createMsg("m1", "2026-11-18T10:00:00", { text: "Hello team" }),
        createMsg("m2", "2026-11-18T10:01:00", {
          text: "Hello secretly deleted",
          deletedAt: "2026-11-18T10:05:00",
        }),
        createMsg("m3", "2026-11-18T10:02:00", { text: "Another topic" }),
      ];

      const matches = searchMatchingMessageIds(messages, "hello");
      expect(matches).toEqual(["m1"]);
    });

    it("returns empty array for empty query", () => {
      const messages = [createMsg("m1", "2026-11-18T10:00:00")];
      expect(searchMatchingMessageIds(messages, "   ")).toEqual([]);
    });
  });

  describe("findLatestOwnMessage", () => {
    it("finds newest non-deleted own message", () => {
      const messages: Message[] = [
        createMsg("m1", "2026-11-18T10:00:00", { senderId: "me" }),
        createMsg("m2", "2026-11-18T10:01:00", {
          senderId: "me",
          deletedAt: "2026-11-18T10:02:00",
        }),
        createMsg("m3", "2026-11-18T10:03:00", { senderId: "other" }),
      ];

      expect(findLatestOwnMessage(messages, "me")?.id).toBe("m1");
    });
  });

  describe("formatFileSize", () => {
    it("keeps bytes whole and rounds larger units to one decimal", () => {
      expect(formatFileSize(512)).toBe("512 B");
      expect(formatFileSize(1536)).toBe("1.5 KB");
      expect(formatFileSize(5 * 1024 * 1024)).toBe("5 MB");
    });
  });

  describe("formatAttachmentLabel", () => {
    const file = (mimeType: string): Attachment => ({
      name: "spec.pdf",
      size: 100,
      mimeType,
      url: "data:,",
    });

    it("labels images as a photo and other files by name", () => {
      expect(formatAttachmentLabel(file("image/png"))).toBe("📷 Photo");
      expect(formatAttachmentLabel(file("application/pdf"))).toBe(
        "📎 spec.pdf",
      );
      expect(formatAttachmentLabel(undefined)).toBe("");
    });
  });
});
