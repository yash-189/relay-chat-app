"use client";

import { EmptyState } from "@/ui/components/feedback/EmptyState";
import { ErrorState } from "@/ui/components/feedback/ErrorState";
import { Skeleton } from "@/ui/primitives/skeleton";
import { filterConversations } from "../filters";
import { useConversationFilters } from "../hooks/useConversationFilters";
import { useConversations } from "../hooks/useConversations";
import { ConversationFilters } from "./ConversationFilters";
import { ConversationItem } from "./ConversationItem";
import { ConversationSearch } from "./ConversationSearch";

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
        {isLoading ? (
          <ConversationListSkeleton />
        ) : isError ? (
          <div className="p-4">
            <ErrorState
              title="Failed to load conversations"
              description={
                error?.message || "Please check your connection and try again."
              }
              onRetry={() => refetch()}
            />
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title="No conversations yet"
              description="Pick a contact to start your first conversation."
            />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title="No conversations found"
              description={
                search.trim()
                  ? `No chats match "${search.trim()}".`
                  : filter === "unread"
                    ? "You have caught up with all messages."
                    : "No group conversations found."
              }
            />
          </div>
        ) : (
          <nav aria-label="Conversations">
            <ul className="divide-y divide-border/40">
              {filtered.map((conversation) => (
                <li key={conversation.id}>
                  <ConversationItem conversation={conversation} />
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </div>
  );
}
