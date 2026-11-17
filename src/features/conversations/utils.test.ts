import { describe, expect, it } from "vitest";
import type { Message } from "@/features/messages";
import type { Conversation } from "./types";
import {
  applyIncomingMessage,
  applyPresenceChange,
  formatLastMessageTime,
  getInitials,
} from "./utils";

describe("live-update cache logic", () => {
  const baseConversations: Conversation[] = [
    {
      id: "conv-1",
      type: "direct",
      name: "Sarah Chen",
      avatarUrl: "https://example.com/sarah.jpg",
      participantIds: ["user-me", "user-2"],
      lastMessage: {
        id: "msg-1",
        conversationId: "conv-1",
        senderId: "user-2",
        text: "Initial message",
        createdAt: "2026-11-17T10:00:00.000Z",
        status: "delivered",
      },
      unreadCount: 1,
      isOnline: true,
    },
    {
      id: "conv-2",
      type: "group",
      name: "Engineering Team",
      avatarUrl: "https://example.com/eng.jpg",
      participantIds: ["user-me", "user-2", "user-3"],
      lastMessage: {
        id: "msg-2",
        conversationId: "conv-2",
        senderId: "user-3",
        text: "Engineering update",
        createdAt: "2026-11-17T09:00:00.000Z",
        status: "delivered",
      },
      unreadCount: 0,
    },
  ];

  it("moves conversation to top and increments unread count when chat is not open", () => {
    const newMessage: Message = {
      id: "msg-new-1",
      conversationId: "conv-2",
      senderId: "user-3",
      text: "New urgent bug reported!",
      createdAt: "2026-11-17T11:00:00.000Z",
      status: "delivered",
    };

    const updated = applyIncomingMessage(
      baseConversations,
      newMessage,
      "conv-1",
    );

    expect(updated[0].id).toBe("conv-2");
    expect(updated[0].lastMessage?.text).toBe("New urgent bug reported!");
    expect(updated[0].unreadCount).toBe(1);
    expect(updated[1].id).toBe("conv-1");
  });

  it("moves conversation to top but does not increment unread count when that chat is open", () => {
    const newMessage: Message = {
      id: "msg-new-2",
      conversationId: "conv-2",
      senderId: "user-3",
      text: "Another message in the open chat",
      createdAt: "2026-11-17T11:05:00.000Z",
      status: "delivered",
    };

    const updated = applyIncomingMessage(
      baseConversations,
      newMessage,
      "conv-2",
    );

    expect(updated[0].id).toBe("conv-2");
    expect(updated[0].lastMessage?.text).toBe(
      "Another message in the open chat",
    );
    expect(updated[0].unreadCount).toBe(0);
  });

  it("returns unchanged conversations if message conversation is not found", () => {
    const newMessage: Message = {
      id: "msg-unknown",
      conversationId: "conv-unknown",
      senderId: "user-99",
      text: "Ghost message",
      createdAt: "2026-11-17T11:10:00.000Z",
      status: "delivered",
    };

    const updated = applyIncomingMessage(baseConversations, newMessage);
    expect(updated).toEqual(baseConversations);
  });

  it("updates presence for direct conversation participants", () => {
    const updated = applyPresenceChange(
      baseConversations,
      "user-2",
      false,
      "user-me",
    );

    const sarahConv = updated.find((c) => c.id === "conv-1");
    expect(sarahConv?.isOnline).toBe(false);

    const engConv = updated.find((c) => c.id === "conv-2");
    expect(engConv?.isOnline).toBeUndefined();
  });
});

describe("formatLastMessageTime", () => {
  const fixedNow = new Date("2026-11-18T12:00:00.000Z");

  it("returns empty string for null or empty input", () => {
    expect(formatLastMessageTime(null)).toBe("");
    expect(formatLastMessageTime(undefined)).toBe("");
    expect(formatLastMessageTime("invalid-date")).toBe("");
  });

  it("formats seconds ago as 'just now'", () => {
    const thirtySecAgo = new Date(fixedNow.getTime() - 30 * 1000).toISOString();
    expect(formatLastMessageTime(thirtySecAgo, fixedNow)).toBe("just now");
  });

  it("formats minutes ago", () => {
    const tenMinAgo = new Date(
      fixedNow.getTime() - 10 * 60 * 1000,
    ).toISOString();
    expect(formatLastMessageTime(tenMinAgo, fixedNow)).toBe("10m ago");
  });

  it("formats hours ago if earlier today", () => {
    const threeHoursAgo = new Date(
      fixedNow.getTime() - 3 * 3600 * 1000,
    ).toISOString();
    expect(formatLastMessageTime(threeHoursAgo, fixedNow)).toBe("3h ago");
  });

  it("formats yesterday", () => {
    const yesterday = new Date(
      fixedNow.getTime() - 25 * 3600 * 1000,
    ).toISOString();
    expect(formatLastMessageTime(yesterday, fixedNow)).toBe("Yesterday");
  });

  it("formats days ago within a week", () => {
    const fourDaysAgo = new Date(
      fixedNow.getTime() - 4 * 24 * 3600 * 1000,
    ).toISOString();
    expect(formatLastMessageTime(fourDaysAgo, fixedNow)).toBe("4d ago");
  });

  it("handles month boundaries correctly", () => {
    const firstOfNov = new Date("2026-11-01T14:00:00.000Z");
    const lastOfOct = new Date("2026-10-31T20:00:00.000Z").toISOString();
    const earlierToday = new Date("2026-11-01T11:00:00.000Z").toISOString();
    const threeDaysAgo = new Date("2026-10-29T14:00:00.000Z").toISOString();

    expect(formatLastMessageTime(lastOfOct, firstOfNov)).toBe("Yesterday");
    expect(formatLastMessageTime(earlierToday, firstOfNov)).toBe("3h ago");
    expect(formatLastMessageTime(threeDaysAgo, firstOfNov)).toBe("3d ago");
  });

  it("handles year boundaries correctly", () => {
    const firstOfJan = new Date("2027-01-01T15:00:00.000Z");
    const newYearsEve = new Date("2026-12-31T22:00:00.000Z").toISOString();
    const earlierToday = new Date("2027-01-01T10:00:00.000Z").toISOString();
    const fourDaysAgo = new Date("2026-12-28T15:00:00.000Z").toISOString();

    expect(formatLastMessageTime(newYearsEve, firstOfJan)).toBe("Yesterday");
    expect(formatLastMessageTime(earlierToday, firstOfJan)).toBe("5h ago");
    expect(formatLastMessageTime(fourDaysAgo, firstOfJan)).toBe("4d ago");
  });
});

describe("getInitials", () => {
  it("extracts initials correctly", () => {
    expect(getInitials("Sarah Chen")).toBe("SC");
    expect(getInitials("Engineering Frontend Architecture")).toBe("EA");
    expect(getInitials("Alex")).toBe("AL");
    expect(getInitials("")).toBe("?");
  });
});
