import type { Message } from "@/features/messages";

export type ConversationType = "direct" | "group";

export interface Conversation {
  id: string;
  type: ConversationType;
  name: string;
  avatarUrl: string;
  participantIds: string[];
  lastMessage: Message | null;
  unreadCount: number;
  isOnline?: boolean;
}

export type ConversationFilter = "all" | "unread" | "groups";
