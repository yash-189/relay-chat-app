export type MessageStatus = "sending" | "sent" | "delivered" | "read";

export interface MessageReaction {
  emoji: string;
  count: number;
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
