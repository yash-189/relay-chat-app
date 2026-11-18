import {
  addMember as mockAddMember,
  removeMember as mockRemoveMember,
} from "@/mocks";

export function addMember(groupId: string, userId: string) {
  return mockAddMember(groupId, userId);
}

export function removeMember(groupId: string, userId: string) {
  return mockRemoveMember(groupId, userId);
}
