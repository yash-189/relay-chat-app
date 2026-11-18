"use client";

import { UserMinus, UserPlus } from "lucide-react";
import { CURRENT_USER_ID, useUsers } from "@/features/users";
import { Button } from "@/ui/primitives/button";
import { Skeleton } from "@/ui/primitives/skeleton";
import { useAddMember } from "../hooks/useAddMember";
import { useRemoveMember } from "../hooks/useRemoveMember";
import type { GroupSummary } from "../types";
import { splitByMembership } from "../utils";
import { MemberRow } from "./MemberRow";

interface GroupInfoPanelProps {
  group: GroupSummary;
}

function MembersSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-busy="true">
      <span className="sr-only">Loading members…</span>
      {Array.from({ length: 4 }, (_, i) => `member-skeleton-${i}`).map(
        (key) => (
          <div key={key} className="flex items-center gap-3">
            <Skeleton className="size-8 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
        ),
      )}
    </div>
  );
}

export function GroupInfoPanel({ group }: GroupInfoPanelProps) {
  const { users, isPending } = useUsers();
  const addMember = useAddMember(group.id);
  const removeMember = useRemoveMember(group.id);

  if (isPending) return <MembersSkeleton />;

  const { members, others } = splitByMembership(
    users,
    group.participantIds,
    CURRENT_USER_ID,
  );
  const isBusy = (userId: string) =>
    (addMember.isPending && addMember.variables?.id === userId) ||
    (removeMember.isPending && removeMember.variables?.id === userId);

  return (
    <div className="flex flex-col gap-6">
      <section aria-labelledby="group-members">
        <h3
          id="group-members"
          className="mb-1 font-medium text-muted-foreground text-xs uppercase"
        >
          Members · {members.length}
        </h3>
        <ul className="divide-y">
          {members.map((user) => {
            const isYou = user.id === CURRENT_USER_ID;
            return (
              <MemberRow
                key={user.id}
                user={user}
                isYou={isYou}
                action={
                  !isYou && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Remove ${user.name}`}
                      disabled={isBusy(user.id)}
                      onClick={() => removeMember.mutate(user)}
                    >
                      <UserMinus />
                    </Button>
                  )
                }
              />
            );
          })}
        </ul>
      </section>

      {others.length > 0 && (
        <section aria-labelledby="group-add-people">
          <h3
            id="group-add-people"
            className="mb-1 font-medium text-muted-foreground text-xs uppercase"
          >
            Add people
          </h3>
          <ul className="divide-y">
            {others.map((user) => (
              <MemberRow
                key={user.id}
                user={user}
                action={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Add ${user.name}`}
                    disabled={isBusy(user.id)}
                    onClick={() => addMember.mutate(user)}
                  >
                    <UserPlus />
                  </Button>
                }
              />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
