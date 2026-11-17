export type MockMessageStatus = "sending" | "sent" | "delivered" | "read";

export interface MockReaction {
  emoji: string;
  count: number;
  userIds: string[];
}

export interface MockMessage {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
  status: MockMessageStatus;
  replyToId?: string;
  editedAt?: string;
  deletedAt?: string;
  reactions?: MockReaction[];
}

export interface MockUser {
  id: string;
  name: string;
  avatarUrl: string;
  isOnline: boolean;
}

export type MockConversationType = "direct" | "group";

export interface MockConversation {
  id: string;
  type: MockConversationType;
  name: string;
  avatarUrl: string;
  participantIds: string[];
  lastMessage: MockMessage | null;
  unreadCount: number;
  isOnline?: boolean;
}

export interface ChatEvents {
  "message:new": MockMessage;
  "presence:change": {
    userId: string;
    isOnline: boolean;
  };
}
