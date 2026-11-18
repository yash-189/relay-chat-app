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

// nothing is uploaded; url is a local data url
export interface Attachment {
  name: string;
  size: number;
  mimeType: string;
  url: string;
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
  attachment?: Attachment;
}

// id of the oldest loaded message; null asks for the newest page
export type MessageCursor = string | null;

export interface MessagePage {
  messages: Message[];
  nextCursor: MessageCursor;
}

export interface SendMessageInput {
  id: string;
  conversationId: string;
  text: string;
  attachment?: Attachment;
  replyToId?: string;
}
