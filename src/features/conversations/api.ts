import { type Message, mapMessage } from "@/features/messages";
import {
  CURRENT_USER_ID,
  type MockConversation,
  type MockMessage,
  getConversations as mockGetConversations,
  markAsRead as mockMarkAsRead,
  subscribe as mockSubscribe,
} from "@/mocks";
import type { Conversation } from "./types";

// the only file that talks to the mock server. mapping to feature types here
// means a real backend only changes this file.

export { CURRENT_USER_ID };

function mapConversation(conv: MockConversation): Conversation {
  return {
    id: conv.id,
    type: conv.type,
    name: conv.name,
    avatarUrl: conv.avatarUrl,
    participantIds: [...conv.participantIds],
    lastMessage: conv.lastMessage ? mapMessage(conv.lastMessage) : null,
    unreadCount: conv.unreadCount,
    isOnline: conv.isOnline,
  };
}

export async function getConversations(): Promise<Conversation[]> {
  const result = await mockGetConversations();
  return result.map(mapConversation);
}

export async function markAsRead(
  conversationId: string,
): Promise<Conversation | null> {
  const result = await mockMarkAsRead(conversationId);
  return result ? mapConversation(result) : null;
}

export function onNewMessage(handler: (message: Message) => void) {
  return mockSubscribe("message:new", (message: MockMessage) =>
    handler(mapMessage(message)),
  );
}

export function onMessageUpdated(handler: (message: Message) => void) {
  return mockSubscribe("message:updated", (message: MockMessage) =>
    handler(mapMessage(message)),
  );
}

export function onPresenceChange(
  handler: (change: { userId: string; isOnline: boolean }) => void,
) {
  return mockSubscribe("presence:change", handler);
}

export function onMembersChange(
  handler: (change: {
    conversationId: string;
    participantIds: string[];
  }) => void,
) {
  return mockSubscribe("members:change", handler);
}
