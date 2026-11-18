import type { Message, MessageReaction } from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;

export interface MessageDateGroup {
  date: string;
  messages: Message[];
}

export type VirtualChatRow =
  | { type: "date-separator"; id: string; date: string }
  | { type: "message"; id: string; message: Message };

export function formatMessageTime(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function isNearBottom(
  scrollTop: number,
  scrollHeight: number,
  clientHeight: number,
  threshold = 100,
): boolean {
  return scrollHeight - scrollTop - clientHeight <= threshold;
}

export function getMessageDateLabel(date: Date, now = new Date()): string {
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

  if (calendarDayDiff === 0) return "Today";
  if (calendarDayDiff === 1) return "Yesterday";

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: now.getFullYear() === date.getFullYear() ? undefined : "numeric",
  }).format(date);
}

export function groupByDate(
  messages: Message[],
  now = new Date(),
): MessageDateGroup[] {
  const groups: MessageDateGroup[] = [];
  const map = new Map<string, Message[]>();

  for (const message of messages) {
    const date = new Date(message.createdAt);
    const label = getMessageDateLabel(date, now);

    const existing = map.get(label);
    const list = existing ?? [];
    if (!existing) {
      map.set(label, list);
      groups.push({ date: label, messages: list });
    }
    list.push(message);
  }

  return groups;
}

export function flattenMessagesWithDates(
  groups: MessageDateGroup[],
): VirtualChatRow[] {
  const rows: VirtualChatRow[] = [];
  for (const group of groups) {
    rows.push({
      type: "date-separator",
      id: `sep-${group.date}`,
      date: group.date,
    });
    for (const message of group.messages) {
      rows.push({
        type: "message",
        id: message.id,
        message,
      });
    }
  }
  return rows;
}

export function formatTypingLabel(names: string[]): string | null {
  if (names.length === 0) return null;
  if (names.length === 1) return `${names[0]} is typing…`;
  if (names.length === 2) return `${names[0]} and ${names[1]} are typing…`;
  return `${names.length} people are typing…`;
}

export function searchMatchingMessageIds(
  messages: Message[] = [],
  query: string,
): string[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];
  return messages
    .filter((m) => !m.deletedAt && m.text.toLowerCase().includes(trimmed))
    .map((m) => m.id);
}

export function findLatestOwnMessage(
  messages: Message[],
  currentUserId: string,
): Message | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg.senderId === currentUserId && !msg.deletedAt) {
      return msg;
    }
  }
  return null;
}

export function findUserReaction(
  reactions: MessageReaction[] = [],
  userId: string,
): string | null {
  return reactions.find((r) => r.userIds.includes(userId))?.emoji ?? null;
}

// one reaction per user: picking the same emoji removes it, a new one replaces it
export function toggleReaction(
  reactions: MessageReaction[] = [],
  emoji: string,
  userId: string,
): MessageReaction[] {
  const isSameEmoji = findUserReaction(reactions, userId) === emoji;
  const withoutUser = reactions
    .map((r) => ({ ...r, userIds: r.userIds.filter((id) => id !== userId) }))
    .filter((r) => r.userIds.length > 0);

  if (isSameEmoji) return withoutUser;

  const existing = withoutUser.find((r) => r.emoji === emoji);
  if (!existing) return [...withoutUser, { emoji, userIds: [userId] }];

  return withoutUser.map((r) =>
    r.emoji === emoji ? { ...r, userIds: [...r.userIds, userId] } : r,
  );
}
