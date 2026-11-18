export type MockMessageStatus =
  | "sending"
  | "sent"
  | "delivered"
  | "read"
  | "failed";

export interface MockReaction {
  emoji: string;
  userIds: string[];
}

export interface MockAttachment {
  name: string;
  size: number;
  mimeType: string;
  url: string;
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
  attachment?: MockAttachment;
}

export interface SendMessageInput {
  id: string;
  conversationId: string;
  text: string;
  attachment?: MockAttachment;
  senderId?: string;
  replyToId?: string;
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
  "message:updated": MockMessage;
  "presence:change": {
    userId: string;
    isOnline: boolean;
  };
  "members:change": {
    conversationId: string;
    participantIds: string[];
  };
  typing: {
    conversationId: string;
    userId: string;
    isTyping: boolean;
  };
}
