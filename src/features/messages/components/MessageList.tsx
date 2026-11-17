"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { ChevronDown } from "lucide-react";
import { useMemo } from "react";
import { useChatStore } from "@/store/chat.store";
import { Button } from "@/ui/primitives/button";
import { CURRENT_USER_ID } from "../api";
import { useAutoScroll } from "../hooks/useAutoScroll";
import { useDeleteMessage } from "../hooks/useDeleteMessage";
import { useSendMessage } from "../hooks/useSendMessage";
import { useToggleReaction } from "../hooks/useToggleReaction";
import { useUsers } from "../hooks/useUsers";
import type { Message, User } from "../types";
import { flattenMessagesWithDates, groupByDate } from "../utils";
import { MessageBubble } from "./MessageBubble";

interface MessageListProps {
  conversationId: string;
  messages: Message[];
  isGroup: boolean;
  highlightedMessageId?: string;
}

export function MessageList({
  conversationId,
  messages,
  isGroup,
  highlightedMessageId,
}: MessageListProps) {
  const { userMap } = useUsers();
  const setReplyToId = useChatStore((s) => s.setReplyToId);
  const setEditingId = useChatStore((s) => s.setEditingId);

  const deleteMutation = useDeleteMessage(conversationId);
  const toggleReactionMutation = useToggleReaction(conversationId);
  const sendMutation = useSendMessage(conversationId);

  const messageMap = useMemo(() => {
    const map = new Map<string, Message>();
    for (const m of messages) {
      map.set(m.id, m);
    }
    return map;
  }, [messages]);

  const rows = useMemo(() => {
    const groups = groupByDate(messages);
    return flattenMessagesWithDates(groups);
  }, [messages]);

  const { containerRef, hasNewMessagesBelow, handleScroll, scrollToBottom } =
    useAutoScroll({
      totalItems: rows.length,
      onScrollToBottom: () => {
        if (rows.length > 0) {
          virtualizer.scrollToIndex(rows.length - 1, { align: "end" });
        }
      },
    });

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => containerRef.current,
    estimateSize: (index) => (rows[index].type === "date-separator" ? 36 : 64),
    overscan: 12,
  });

  const handleScrollToMessage = (id: string) => {
    const index = rows.findIndex(
      (r) => r.type === "message" && r.message.id === id,
    );
    if (index !== -1) {
      virtualizer.scrollToIndex(index, { align: "center", behavior: "smooth" });
    }
  };

  const handleRetrySend = (message: Message) => {
    sendMutation.mutate({
      id: message.id,
      conversationId: message.conversationId,
      text: message.text,
      replyToId: message.replyToId,
    });
  };

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        role="log"
        aria-label="Messages"
        className="flex-1 overflow-y-auto px-2 py-4"
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const row = rows[virtualRow.index];
            if (!row) return null;

            return (
              <div
                key={row.id}
                data-index={virtualRow.index}
                ref={virtualizer.measureElement}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                {row.type === "date-separator" ? (
                  <div className="my-3 flex items-center justify-center">
                    <span className="rounded-full bg-muted/80 px-3 py-0.5 font-medium text-muted-foreground text-xs shadow-2xs">
                      {row.date}
                    </span>
                  </div>
                ) : (
                  <MessageRow
                    message={row.message}
                    isGroup={isGroup}
                    isHighlighted={row.message.id === highlightedMessageId}
                    replyMessage={
                      row.message.replyToId
                        ? messageMap.get(row.message.replyToId)
                        : undefined
                    }
                    userMap={userMap}
                    onReply={() => setReplyToId(conversationId, row.message.id)}
                    onEdit={() => setEditingId(conversationId, row.message.id)}
                    onDelete={() => deleteMutation.mutate(row.message.id)}
                    onToggleReaction={(emoji) =>
                      toggleReactionMutation.mutate({
                        messageId: row.message.id,
                        emoji,
                      })
                    }
                    onScrollToMessage={handleScrollToMessage}
                    onRetrySend={() => handleRetrySend(row.message)}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {hasNewMessagesBelow && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => scrollToBottom("smooth")}
            className="gap-1.5 shadow-md hover:shadow-lg"
          >
            <span>New messages</span>
            <ChevronDown className="size-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}

interface MessageRowProps {
  message: Message;
  isGroup: boolean;
  isHighlighted: boolean;
  replyMessage?: Message;
  userMap: Map<string, User>;
  onReply: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleReaction: (emoji: string) => void;
  onScrollToMessage: (id: string) => void;
  onRetrySend: () => void;
}

function MessageRow({
  message,
  isGroup,
  isHighlighted,
  replyMessage,
  userMap,
  ...handlers
}: MessageRowProps) {
  const isOwn = message.senderId === CURRENT_USER_ID;
  const sender = userMap.get(message.senderId);
  const replySender = replyMessage
    ? userMap.get(replyMessage.senderId)
    : undefined;

  return (
    <MessageBubble
      message={message}
      isOwn={isOwn}
      senderName={sender?.name}
      senderAvatarUrl={sender?.avatarUrl}
      showSenderHeader={isGroup && !isOwn}
      replyMessage={replyMessage}
      replySenderName={replySender?.name}
      isHighlighted={isHighlighted}
      {...handlers}
    />
  );
}
