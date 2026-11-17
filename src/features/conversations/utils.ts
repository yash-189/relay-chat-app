import type { Message } from "@/features/messages";
import { formatDate } from "@/shared/utils/formatDate";
import { CURRENT_USER_ID } from "./api";
import type { Conversation } from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;

// "just now", "5m ago", "3h ago", "Yesterday", "4d ago", then a date
export function formatLastMessageTime(
  isoDate: string | null | undefined,
  now = new Date(),
): string {
  if (!isoDate) return "";

  const date = new Date(isoDate);
  const time = date.getTime();
  if (Number.isNaN(time)) return "";

  const diffMs = now.getTime() - time;
  if (diffMs < 0) return "just now";

  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "just now";

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;

  // calendar days in the user's timezone, so "yesterday" matches their clock
  const startOfNow = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const startOfDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();
  const calendarDayDiff = Math.round((startOfNow - startOfDate) / DAY_MS);

  if (calendarDayDiff === 0) {
    const diffHours = Math.floor(diffMin / 60);
    return `${diffHours}h ago`;
  }

  if (calendarDayDiff === 1) {
    return "Yesterday";
  }

  if (calendarDayDiff < 7) {
    return `${calendarDayDiff}d ago`;
  }

  return formatDate(isoDate);
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// moves the chat to the top. unread goes up only if the chat isn't open.
export function applyIncomingMessage(
  conversations: Conversation[],
  message: Message,
  openChatId?: string,
): Conversation[] {
  const existing = conversations.find((c) => c.id === message.conversationId);
  if (!existing) return conversations;

  const isOpen = openChatId === message.conversationId;
  const updated: Conversation = {
    ...existing,
    lastMessage: message,
    unreadCount: isOpen ? 0 : existing.unreadCount + 1,
  };

  return [
    updated,
    ...conversations.filter((c) => c.id !== message.conversationId),
  ];
}

// only direct chats show an online dot; group chats are left as is
export function applyPresenceChange(
  conversations: Conversation[],
  userId: string,
  isOnline: boolean,
  currentUserId: string = CURRENT_USER_ID,
): Conversation[] {
  return conversations.map((conv) => {
    if (
      conv.type === "direct" &&
      conv.participantIds.includes(userId) &&
      userId !== currentUserId
    ) {
      return {
        ...conv,
        isOnline,
      };
    }
    return conv;
  });
}
