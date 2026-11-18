"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "@/lib/toast";
import { addMember } from "../api";

// the members:change event updates the conversation cache, so no manual cache work here
export function useAddMember(groupId: string) {
  return useMutation({
    mutationFn: (user: { id: string; name: string }) =>
      addMember(groupId, user.id),
    onSuccess: (_ids, user) => toast.success(`${user.name} added`),
  });
}
