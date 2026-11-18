"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "@/lib/toast";
import { removeMember } from "../api";

// the members:change event updates the conversation cache, so no manual cache work here
export function useRemoveMember(groupId: string) {
  return useMutation({
    mutationFn: (user: { id: string; name: string }) =>
      removeMember(groupId, user.id),
    onSuccess: (_ids, user) => toast.success(`${user.name} removed`),
  });
}
