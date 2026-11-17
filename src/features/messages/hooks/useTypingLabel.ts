"use client";

import { formatTypingLabel } from "../utils";
import { useTypingUsers } from "./useTypingUsers";
import { useUsers } from "./useUsers";

export function useTypingLabel(conversationId: string): string | null {
  const typingUserIds = useTypingUsers(conversationId);
  const { userMap } = useUsers();

  const names = typingUserIds.map((id) => userMap.get(id)?.name ?? "Someone");
  return formatTypingLabel(names);
}
