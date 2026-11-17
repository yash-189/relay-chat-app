import {
  CURRENT_USER_ID,
  type MockMessage,
  type MockReaction,
  type MockUser,
  deleteMessage as mockDeleteMessage,
  editMessage as mockEditMessage,
  getMessages as mockGetMessages,
  getUsers as mockGetUsers,
  sendMessage as mockSendMessage,
  subscribe as mockSubscribe,
  toggleReaction as mockToggleReaction,
} from "@/mocks";
import type { Message, MessageReaction, SendMessageInput, User } from "./types";

export { CURRENT_USER_ID };

function mapReaction(r: MockReaction): MessageReaction {
  return {
    emoji: r.emoji,
    userIds: [...r.userIds],
  };
}

function mapMessage(msg: MockMessage): Message {
  return {
    id: msg.id,
    conversationId: msg.conversationId,
    senderId: msg.senderId,
    text: msg.text,
    createdAt: msg.createdAt,
    status: msg.status,
    replyToId: msg.replyToId,
    editedAt: msg.editedAt,
    deletedAt: msg.deletedAt,
    reactions: msg.reactions?.map(mapReaction),
  };
}

function mapUser(u: MockUser): User {
  return {
    id: u.id,
    name: u.name,
    avatarUrl: u.avatarUrl,
    isOnline: u.isOnline,
  };
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  const result = await mockGetMessages(conversationId);
  return result.map(mapMessage);
}

export async function sendMessage(input: SendMessageInput): Promise<Message> {
  const result = await mockSendMessage({
    id: input.id,
    conversationId: input.conversationId,
    text: input.text,
    replyToId: input.replyToId,
    senderId: CURRENT_USER_ID,
  });
  return mapMessage(result);
}

export async function editMessage(
  id: string,
  text: string,
): Promise<Message | null> {
  const result = await mockEditMessage(id, text);
  return result ? mapMessage(result) : null;
}

export async function deleteMessage(id: string): Promise<Message | null> {
  const result = await mockDeleteMessage(id);
  return result ? mapMessage(result) : null;
}

export async function toggleReaction(
  id: string,
  emoji: string,
): Promise<Message | null> {
  const result = await mockToggleReaction(id, emoji, CURRENT_USER_ID);
  return result ? mapMessage(result) : null;
}

export async function getUsers(): Promise<User[]> {
  const result = await mockGetUsers();
  return result.map(mapUser);
}

export function onNewMessage(handler: (message: Message) => void) {
  return mockSubscribe("message:new", (msg) => handler(mapMessage(msg)));
}

export function onMessageUpdated(handler: (message: Message) => void) {
  return mockSubscribe("message:updated", (msg) => handler(mapMessage(msg)));
}

export function onTyping(
  handler: (data: {
    conversationId: string;
    userId: string;
    isTyping: boolean;
  }) => void,
) {
  return mockSubscribe("typing", handler);
}
