"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { onPresenceChange } from "../api";
import { userKeys, userQueries } from "../queries";
import type { User } from "../types";

// every user with live online status. several components call this; the
// presence update just sets a value, so applying it more than once is harmless.
export function useUsers() {
  const queryClient = useQueryClient();
  const query = useQuery(userQueries.list());

  useEffect(
    () =>
      onPresenceChange(({ userId, isOnline }) => {
        queryClient.setQueryData<User[]>(userKeys.list(), (users) =>
          users?.map((u) => (u.id === userId ? { ...u, isOnline } : u)),
        );
      }),
    [queryClient],
  );

  const userMap = useMemo(
    () => new Map((query.data ?? []).map((u) => [u.id, u])),
    [query.data],
  );

  return { ...query, users: query.data ?? [], userMap };
}
