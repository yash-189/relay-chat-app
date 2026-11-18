"use client";

import { useUsers } from "@/features/users";
import { formatTypingLabel } from "../utils";
import { useTypingUsers } from "./useTypingUsers";

export function useTypingLabel(conversationId: string): string | null {
  const typingUserIds = useTypingUsers(conversationId);
  const { userMap } = useUsers();

  const names = typingUserIds.map((id) => userMap.get(id)?.name ?? "Someone");
  return formatTypingLabel(names);
}
