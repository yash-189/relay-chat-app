"use client";

import { Tabs, TabsList, TabsTrigger } from "@/ui/primitives/tabs";
import type { ConversationFilter } from "../types";

interface ConversationFiltersProps {
  filter: ConversationFilter;
  onFilterChange: (filter: ConversationFilter) => void;
  unreadCount?: number;
}

export function ConversationFilters({
  filter,
  onFilterChange,
  unreadCount,
}: ConversationFiltersProps) {
  return (
    <Tabs
      value={filter}
      onValueChange={(val) => onFilterChange(val as ConversationFilter)}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="unread" className="gap-1.5">
          <span>Unread</span>
          {typeof unreadCount === "number" && unreadCount > 0 && (
            <span className="flex size-4 items-center justify-center rounded-full bg-primary/10 font-medium text-primary text-xs">
              {unreadCount}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="groups">Groups</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
