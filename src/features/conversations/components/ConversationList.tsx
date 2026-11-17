"use client";

import { EmptyState } from "@/ui/components/feedback/EmptyState";
import { ErrorState } from "@/ui/components/feedback/ErrorState";
import { Skeleton } from "@/ui/primitives/skeleton";
import { filterConversations } from "../filters";
import { useConversationFilters } from "../hooks/useConversationFilters";
import { useConversations } from "../hooks/useConversations";
import type { Conversation, ConversationFilter } from "../types";
import { ConversationFilters } from "./ConversationFilters";
import { ConversationItem } from "./ConversationItem";
import { ConversationSearch } from "./ConversationSearch";

const EMPTY_FILTER_MESSAGES = {
  all: "No conversations yet.",
  unread: "You're all caught up.",
  groups: "No group conversations yet.",
} satisfies Record<ConversationFilter, string>;

function getNoResultsMessage(query: string, filter: ConversationFilter) {
  if (query) return `No chats match "${query}".`;
  return EMPTY_FILTER_MESSAGES[filter];
}

export function ConversationListSkeleton() {
  return (
    <div aria-busy="true" className="space-y-3 p-3">
      <span className="sr-only">Loading conversations...</span>
      {Array.from({ length: 6 }).map((_, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length placeholders never reorder
        <div key={index} className="flex items-center gap-3 py-1.5">
          <Skeleton className="size-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="flex justify-between gap-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-10" />
            </div>
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface ConversationListContentProps {
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  conversations: Conversation[];
  filtered: Conversation[];
  search: string;
  filter: ConversationFilter;
  onRetry: () => void;
}

function ConversationListContent({
  isLoading,
  isError,
  error,
  conversations,
  filtered,
  search,
  filter,
  onRetry,
}: ConversationListContentProps) {
  if (isLoading) {
    return <ConversationListSkeleton />;
  }

  if (isError) {
    return (
      <div className="p-4">
        <ErrorState
          title="Failed to load conversations"
          description={
            error?.message || "Please check your connection and try again."
          }
          onRetry={onRetry}
        />
      </div>
    );
  }

  if (!conversations?.length) {
    return (
      <div className="p-4">
        <EmptyState
          title="No conversations yet"
          description="Pick a contact to start your first conversation."
        />
      </div>
    );
  }

  if (!filtered?.length) {
    const query = search.trim();

    return (
      <div className="p-4">
        <EmptyState
          title="No conversations found"
          description={getNoResultsMessage(query, filter)}
        />
      </div>
    );
  }

  return (
    <nav aria-label="Conversations">
      <ul className="divide-y divide-border/40">
        {filtered.map((conversation) => (
          <li key={conversation.id}>
            <ConversationItem conversation={conversation} />
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function ConversationList() {
  const {
    data: conversations = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useConversations();
  const { filter, setFilter, search, setSearch, debouncedSearch } =
    useConversationFilters();

  const filtered = filterConversations(conversations, debouncedSearch, filter);
  const totalUnread = conversations.filter((c) => c.unreadCount > 0).length;

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <div className="shrink-0 space-y-2 border-b p-3 pb-2">
        <ConversationSearch value={search} onChange={setSearch} />
        <ConversationFilters
          filter={filter}
          onFilterChange={setFilter}
          unreadCount={totalUnread}
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <ConversationListContent
          isLoading={isLoading}
          isError={isError}
          error={error}
          conversations={conversations}
          filtered={filtered}
          search={search}
          filter={filter}
          onRetry={() => refetch()}
        />
      </div>
    </div>
  );
}
