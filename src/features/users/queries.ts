import { queryOptions } from "@tanstack/react-query";
import { getUsers } from "./api";

export const userKeys = {
  all: ["users"] as const,
  list: () => [...userKeys.all, "list"] as const,
};

export const userQueries = {
  list: () =>
    queryOptions({
      queryKey: userKeys.list(),
      queryFn: () => getUsers(),
      staleTime: 60_000,
    }),
};
