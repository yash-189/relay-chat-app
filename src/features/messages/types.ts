export type MessageStatus =
  | "sending"
  | "sent"
  | "delivered"
  | "read"
  | "failed";

export interface MessageReaction {
  emoji: string;
  userIds: string[];
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
  status: MessageStatus;
  replyToId?: string;
  editedAt?: string;
  deletedAt?: string;
  reactions?: MessageReaction[];
}

export interface SendMessageInput {
  id: string;
  conversationId: string;
  text: string;
  replyToId?: string;
}
