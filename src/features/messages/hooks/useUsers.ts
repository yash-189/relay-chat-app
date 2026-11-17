"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { messageQueries } from "../queries";
import type { User } from "../types";

export function useUsers() {
  const query = useQuery(messageQueries.users());

  const userMap = useMemo(() => {
    const map = new Map<string, User>();
    for (const u of query.data ?? []) {
      map.set(u.id, u);
    }
    return map;
  }, [query.data]);

  return {
    ...query,
    users: query.data ?? [],
    userMap,
  };
}
