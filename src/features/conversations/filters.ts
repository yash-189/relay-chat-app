import type { Conversation, ConversationFilter } from "./types";

export function filterConversations(
  conversations: Conversation[],
  query: string,
  filter: ConversationFilter = "all",
): Conversation[] {
  const normalizedQuery = query.trim().toLowerCase();

  return conversations.filter((conversation) => {
    if (filter === "unread" && conversation.unreadCount <= 0) {
      return false;
    }
    if (filter === "groups" && conversation.type !== "group") {
      return false;
    }

    if (normalizedQuery.length > 0) {
      const nameMatches = conversation.name
        .toLowerCase()
        .includes(normalizedQuery);
      const messageMatches =
        conversation.lastMessage?.text
          .toLowerCase()
          .includes(normalizedQuery) ?? false;

      if (!nameMatches && !messageMatches) {
        return false;
      }
    }

    return true;
  });
}
