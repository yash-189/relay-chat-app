import {
  ALL_INITIAL_MESSAGES,
  CURRENT_USER_ID,
  SEED_CONVERSATIONS,
  SEED_USERS,
} from "./data";
import { chatEmitter } from "./emitter";
import type {
  MockConversation,
  MockMessage,
  MockMessageStatus,
  MockUser,
  SendMessageInput,
} from "./types";

// in-memory store for the mock server. it resets on page reload.

const MIN_LATENCY_MS = 300;
const MAX_LATENCY_MS = 600;

const users: MockUser[] = SEED_USERS.map((user) => ({ ...user }));
let conversations: MockConversation[] = SEED_CONVERSATIONS.map((c) => ({
  ...c,
  lastMessage: c.lastMessage ? { ...c.lastMessage } : null,
  participantIds: [...c.participantIds],
}));
const messages: MockMessage[] = ALL_INITIAL_MESSAGES.map((m) => ({
  ...m,
  reactions: m.reactions
    ? m.reactions.map((r) => ({ ...r, userIds: [...r.userIds] }))
    : undefined,
}));

let shouldFailNextSend = false;

export function failNextSendMessage(): void {
  shouldFailNextSend = true;
}

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

export async function getMessages(
  conversationId: string,
): Promise<MockMessage[]> {
  await fakeLatency();
  return messages
    .filter((m) => m.conversationId === conversationId)
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    )
    .map((m) => ({ ...m }));
}

export async function sendMessage(
  input: SendMessageInput,
): Promise<MockMessage> {
  await fakeLatency();

  if (shouldFailNextSend) {
    shouldFailNextSend = false;
    throw new Error("Failed to send message");
  }

  const senderId = input.senderId ?? CURRENT_USER_ID;
  const newMessage: MockMessage = {
    id: input.id,
    conversationId: input.conversationId,
    senderId,
    text: input.text,
    createdAt: new Date().toISOString(),
    status: "sent",
    replyToId: input.replyToId,
    attachment: input.attachment,
  };

  messages.push(newMessage);

  const conv = conversations.find((c) => c.id === input.conversationId);
  if (conv) {
    conv.lastMessage = newMessage;
    if (senderId !== CURRENT_USER_ID) {
      conv.unreadCount += 1;
    }
    conversations = [conv, ...conversations.filter((c) => c.id !== conv.id)];
  }

  chatEmitter.emit("message:new", { ...newMessage });

  return { ...newMessage };
}

export async function editMessage(
  id: string,
  text: string,
): Promise<MockMessage | null> {
  await fakeLatency();
  const message = messages.find((m) => m.id === id);
  if (!message) return null;

  message.text = text;
  message.editedAt = new Date().toISOString();

  const conv = conversations.find((c) => c.id === message.conversationId);
  if (conv && conv.lastMessage?.id === id) {
    conv.lastMessage = { ...message };
  }

  chatEmitter.emit("message:updated", { ...message });
  return { ...message };
}

export async function deleteMessage(id: string): Promise<MockMessage | null> {
  await fakeLatency();
  const message = messages.find((m) => m.id === id);
  if (!message) return null;

  message.deletedAt = new Date().toISOString();
  message.text = "";

  const conv = conversations.find((c) => c.id === message.conversationId);
  if (conv && conv.lastMessage?.id === id) {
    conv.lastMessage = { ...message };
  }

  chatEmitter.emit("message:updated", { ...message });
  return { ...message };
}

export async function toggleReaction(
  messageId: string,
  emoji: string,
  userId = CURRENT_USER_ID,
): Promise<MockMessage | null> {
  await fakeLatency();
  const message = messages.find((m) => m.id === messageId);
  if (!message) return null;

  const reactions = message.reactions ?? [];
  const hadSameEmoji = reactions.some(
    (r) => r.emoji === emoji && r.userIds.includes(userId),
  );
  const withoutUser = reactions
    .map((r) => ({ ...r, userIds: r.userIds.filter((id) => id !== userId) }))
    .filter((r) => r.userIds.length > 0);
  const existing = withoutUser.find((r) => r.emoji === emoji);

  if (!hadSameEmoji && existing) existing.userIds.push(userId);
  if (!hadSameEmoji && !existing)
    withoutUser.push({ emoji, userIds: [userId] });
  message.reactions = withoutUser;
  chatEmitter.emit("message:updated", { ...message });
  return { ...message };
}

function findGroup(conversationId: string): MockConversation {
  const conversation = conversations.find((c) => c.id === conversationId);
  if (!conversation || conversation.type !== "group") {
    throw new Error("Group not found");
  }
  return conversation;
}

function setParticipants(conversation: MockConversation, ids: string[]) {
  conversation.participantIds = ids;
  chatEmitter.emit("members:change", {
    conversationId: conversation.id,
    participantIds: [...ids],
  });
  return [...ids];
}

export async function addMember(
  conversationId: string,
  userId: string,
): Promise<string[]> {
  await fakeLatency();
  const group = findGroup(conversationId);
  if (!users.some((u) => u.id === userId)) throw new Error("User not found");
  if (group.participantIds.includes(userId)) return [...group.participantIds];
  return setParticipants(group, [...group.participantIds, userId]);
}

export async function removeMember(
  conversationId: string,
  userId: string,
): Promise<string[]> {
  await fakeLatency();
  const group = findGroup(conversationId);
  if (userId === CURRENT_USER_ID) {
    throw new Error("You can't remove yourself from a group");
  }
  return setParticipants(
    group,
    group.participantIds.filter((id) => id !== userId),
  );
}

// direct access for the simulator, which writes without fake latency
export function listConversations(): MockConversation[] {
  return conversations;
}

export function listUsers(): MockUser[] {
  return users;
}

export function insertIncomingMessage(message: MockMessage): void {
  const conv = conversations.find((c) => c.id === message.conversationId);
  if (!conv) return;

  messages.push(message);
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

export function updateMessageStatus(
  messageId: string,
  status: MockMessageStatus,
): MockMessage | null {
  const message = messages.find((m) => m.id === messageId);
  if (!message) return null;
  message.status = status;
  return { ...message };
}
