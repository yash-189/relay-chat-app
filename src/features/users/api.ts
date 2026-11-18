import {
  CURRENT_USER_ID,
  type MockUser,
  getUsers as mockGetUsers,
  subscribe as mockSubscribe,
} from "@/mocks";
import type { User } from "./types";

export { CURRENT_USER_ID };

function mapUser(user: MockUser): User {
  return {
    id: user.id,
    name: user.name,
    avatarUrl: user.avatarUrl,
    isOnline: user.isOnline,
  };
}

export async function getUsers(): Promise<User[]> {
  const users = await mockGetUsers();
  return users.map(mapUser);
}

export function onPresenceChange(
  handler: (change: { userId: string; isOnline: boolean }) => void,
) {
  return mockSubscribe("presence:change", handler);
}
