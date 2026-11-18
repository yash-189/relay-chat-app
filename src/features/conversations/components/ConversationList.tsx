"use client";
import { cn } from "@/lib/utils";

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

const PREVIEW_WIDTHS = ["w-3/4", "w-1/2", "w-2/3", "w-3/5", "w-4/5", "w-1/2"];

// mirrors ConversationItem's box model so rows don't move when data arrives
function ConversationRowsSkeleton() {
  return (
    <div aria-busy="true">
      <span className="sr-only">Loading conversations...</span>
      {PREVIEW_WIDTHS.map((width, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: fixed placeholders never reorder
        <div key={index} className="flex items-center gap-3 px-3 py-3">
          <Skeleton className="size-8 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex h-5.5 items-center justify-between gap-2">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-3 w-10" />
            </div>
            <div className="flex h-5 items-center">
              <Skeleton className={cn("h-3", width)} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// the suspense fallback also draws the toolbar, so search and filters don't pop in
export function ConversationListSkeleton() {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <div className="shrink-0 space-y-2 border-b p-3 pb-2">
        <Skeleton className="h-9 w-full rounded-md" />
        <Skeleton className="h-8 w-full rounded-lg" />
      </div>
      <ConversationRowsSkeleton />
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
    return <ConversationRowsSkeleton />;
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
