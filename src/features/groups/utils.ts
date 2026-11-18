import type { User } from "@/features/users";

// you first, then whoever is online, then alphabetical
function compareMembers(a: User, b: User, currentUserId: string) {
  if (a.id === currentUserId) return -1;
  if (b.id === currentUserId) return 1;
  if (a.isOnline !== b.isOnline) return a.isOnline ? -1 : 1;
  return a.name.localeCompare(b.name);
}

export function splitByMembership(
  users: User[],
  participantIds: string[],
  currentUserId: string,
) {
  const memberIds = new Set(participantIds);
  const members = users
    .filter((u) => memberIds.has(u.id))
    .sort((a, b) => compareMembers(a, b, currentUserId));
  const others = users
    .filter((u) => !memberIds.has(u.id))
    .sort((a, b) => a.name.localeCompare(b.name));
  return { members, others };
}
