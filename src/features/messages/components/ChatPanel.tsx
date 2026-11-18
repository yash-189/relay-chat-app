"use client";

import { useMemo, useState } from "react";
import { useUsers } from "@/features/users";
import { useChatStore } from "@/store/chat.store";
import { CenteredState } from "@/ui/components/feedback/CenteredState";
import { EmptyState } from "@/ui/components/feedback/EmptyState";
import { ErrorState } from "@/ui/components/feedback/ErrorState";
import { useMessages } from "../hooks/useMessages";
import type { Message } from "../types";
import { searchMatchingMessageIds } from "../utils";
import { MessageComposer } from "./MessageComposer";
import { MessageList, type OlderMessages } from "./MessageList";
import { MessageListSkeleton } from "./MessageListSkeleton";
import { MessageSearch } from "./MessageSearch";

interface ChatMessageContentProps {
  isLoading: boolean;
  isError: boolean;
  messages?: Message[];
  conversationId: string;
  isGroup: boolean;
  highlightedMessageId?: string;
  olderMessages: OlderMessages;
  onRetry: () => void;
}

function ChatMessageContent({
  isLoading,
  isError,
  messages,
  conversationId,
  isGroup,
  highlightedMessageId,
  olderMessages,
  onRetry,
}: ChatMessageContentProps) {
  if (isLoading) {
    return <MessageListSkeleton />;
  }

  if (isError) {
    return (
      <CenteredState>
        <ErrorState
          title="Couldn't load messages"
          description="Something went wrong loading this chat."
          onRetry={onRetry}
        />
      </CenteredState>
    );
  }

  if (!messages?.length) {
    return (
      <CenteredState>
        <EmptyState
          title="No messages yet"
          description="Send a message to start the conversation."
        />
      </CenteredState>
    );
  }

  return (
    <MessageList
      conversationId={conversationId}
      messages={messages}
      isGroup={isGroup}
      highlightedMessageId={highlightedMessageId}
      olderMessages={olderMessages}
    />
  );
}

interface ChatPanelProps {
  conversationId: string;
  isGroup: boolean;
}

export function ChatPanel({ conversationId, isGroup }: ChatPanelProps) {
  const {
    data: messages,
    isLoading,
    isError,
    refetch,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useMessages(conversationId);
  const { userMap } = useUsers();

  const isSearchOpen = useChatStore((s) => s.isSearchOpen);
  const setSearchOpen = useChatStore((s) => s.setSearchOpen);
  const replyToId = useChatStore((s) => s.replyTo[conversationId]);
  const editingId = useChatStore((s) => s.editingId[conversationId]);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  const matches = useMemo(
    () => searchMatchingMessageIds(messages, searchQuery),
    [messages, searchQuery],
  );

  const handleSearchNavigate = (direction: "up" | "down") => {
    if (matches.length === 0) return;
    const delta = direction === "down" ? 1 : -1;
    setCurrentMatchIndex(
      (prev) => (prev + delta + matches.length) % matches.length,
    );
  };

  const handleCloseSearch = () => {
    setSearchOpen(false);
    setSearchQuery("");
    setCurrentMatchIndex(0);
  };

  const replyMessage = useMemo(
    () =>
      replyToId ? (messages?.find((m) => m.id === replyToId) ?? null) : null,
    [messages, replyToId],
  );

  const replySenderName = useMemo(() => {
    if (!replyMessage) return undefined;
    return userMap.get(replyMessage.senderId)?.name;
  }, [replyMessage, userMap]);

  const editingMessage = useMemo(
    () =>
      editingId ? (messages?.find((m) => m.id === editingId) ?? null) : null,
    [messages, editingId],
  );

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-background">
      {isSearchOpen && (
        <MessageSearch
          query={searchQuery}
          onQueryChange={(q) => {
            setSearchQuery(q);
            setCurrentMatchIndex(0);
          }}
          matchCount={matches.length}
          currentMatchIndex={currentMatchIndex}
          onNavigate={handleSearchNavigate}
          onClose={handleCloseSearch}
        />
      )}

      <ChatMessageContent
        isLoading={isLoading}
        isError={isError}
        messages={messages}
        conversationId={conversationId}
        isGroup={isGroup}
        highlightedMessageId={matches[currentMatchIndex]}
        olderMessages={{
          hasMore: hasNextPage,
          isLoading: isFetchingNextPage,
          load: () => fetchNextPage(),
        }}
        onRetry={() => refetch()}
      />

      <MessageComposer
        conversationId={conversationId}
        messages={messages ?? []}
        replyMessage={replyMessage}
        replySenderName={replySenderName}
        editingMessage={editingMessage}
      />
    </div>
  );
}
