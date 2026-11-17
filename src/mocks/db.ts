import { CURRENT_USER_ID, SEED_CONVERSATIONS, SEED_USERS } from "./data";
import type { MockConversation, MockMessage, MockUser } from "./types";

// in-memory store for the mock server. it resets on page reload.

const MIN_LATENCY_MS = 300;
const MAX_LATENCY_MS = 600;

const users: MockUser[] = SEED_USERS.map((user) => ({ ...user }));
let conversations: MockConversation[] = SEED_CONVERSATIONS.map((c) => ({
  ...c,
  lastMessage: c.lastMessage ? { ...c.lastMessage } : null,
  participantIds: [...c.participantIds],
}));

const fakeLatency = (min = MIN_LATENCY_MS, max = MAX_LATENCY_MS) => {
  const duration = Math.floor(min + Math.random() * (max - min));
  return new Promise<void>((resolve) => setTimeout(resolve, duration));
};

export async function getUsers(): Promise<MockUser[]> {
  await fakeLatency();
  return users.map((u) => ({ ...u }));
}

export async function getConversations(): Promise<MockConversation[]> {
  await fakeLatency();

  const userMap = new Map(users.map((u) => [u.id, u]));

  const updated = conversations.map((conv) => {
    if (conv.type === "direct") {
      const otherId = conv.participantIds.find((id) => id !== CURRENT_USER_ID);
      const otherUser = otherId ? userMap.get(otherId) : undefined;
      return {
        ...conv,
        isOnline: otherUser ? otherUser.isOnline : false,
      };
    }
    return { ...conv };
  });

  return updated.sort((a, b) => {
    const timeA = a.lastMessage
      ? new Date(a.lastMessage.createdAt).getTime()
      : 0;
    const timeB = b.lastMessage
      ? new Date(b.lastMessage.createdAt).getTime()
      : 0;
    return timeB - timeA;
  });
}

export async function markAsRead(
  conversationId: string,
): Promise<MockConversation | null> {
  await fakeLatency();
  const conv = conversations.find((c) => c.id === conversationId);
  if (!conv) return null;

  conv.unreadCount = 0;
  return { ...conv };
}

// used by the simulator, which writes without fake latency
export function listConversations(): MockConversation[] {
  return conversations;
}

export function listUsers(): MockUser[] {
  return users;
}

export function insertIncomingMessage(message: MockMessage): void {
  const conv = conversations.find((c) => c.id === message.conversationId);
  if (!conv) return;

  conv.lastMessage = message;
  conv.unreadCount += 1;

  conversations = [conv, ...conversations.filter((c) => c.id !== conv.id)];
}

export function toggleUserOnline(userId: string): boolean | null {
  const user = users.find((u) => u.id === userId);
  if (!user) return null;

  user.isOnline = !user.isOnline;

  for (const conv of conversations) {
    if (conv.type === "direct" && conv.participantIds.includes(userId)) {
      conv.isOnline = user.isOnline;
    }
  }

  return user.isOnline;
}
