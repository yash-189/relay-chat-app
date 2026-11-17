"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import type { ConversationFilter } from "../types";

const SEARCH_DEBOUNCE_MS = 250;

// search and filter live in the url so they survive refresh and back/forward.
// typing updates local state at once; the url follows after the debounce.
export function useConversationFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filterParam = searchParams.get("filter") as ConversationFilter | null;
  const filter: ConversationFilter =
    filterParam === "unread" || filterParam === "groups" ? filterParam : "all";

  const urlQuery = searchParams.get("q") ?? "";
  const [searchTerm, setSearchTerm] = useState(urlQuery);

  const debouncedSearch = useDebouncedValue(searchTerm, SEARCH_DEBOUNCE_MS);

  useEffect(() => {
    setSearchTerm((current) => (current === urlQuery ? current : urlQuery));
  }, [urlQuery]);

  const updateUrl = useCallback(
    (nextFilter: ConversationFilter, nextQuery: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (nextFilter === "all") {
        params.delete("filter");
      } else {
        params.set("filter", nextFilter);
      }

      const trimmed = nextQuery.trim();
      if (trimmed.length === 0) {
        params.delete("q");
      } else {
        params.set("q", trimmed);
      }

      const qs = params.toString();
      const target = qs ? `${pathname}?${qs}` : pathname;
      router.replace(target, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    if (debouncedSearch.trim() !== urlQuery.trim()) {
      updateUrl(filter, debouncedSearch);
    }
  }, [debouncedSearch, filter, updateUrl, urlQuery]);

  const setFilter = useCallback(
    (nextFilter: ConversationFilter) => {
      updateUrl(nextFilter, searchTerm);
    },
    [searchTerm, updateUrl],
  );

  return {
    filter,
    setFilter,
    search: searchTerm,
    setSearch: setSearchTerm,
    debouncedSearch,
  };
}
