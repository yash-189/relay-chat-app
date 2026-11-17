"use client";

import { Users } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { Routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarImage,
} from "@/ui/primitives/avatar";
import { Badge } from "@/ui/primitives/badge";
import { CURRENT_USER_ID } from "../api";
import type { Conversation } from "../types";
import { formatLastMessageTime, getInitials } from "../utils";

interface ConversationItemProps {
  conversation: Conversation;
  isActive?: boolean;
}

export function ConversationItem({
  conversation,
  isActive: explicitIsActive,
}: ConversationItemProps) {
  const pathname = usePathname();
  const params = useParams();

  const isCurrentChat =
    explicitIsActive ??
    (params?.id === conversation.id ||
      pathname === Routes.chat(conversation.id));

  let previewText = "";
  if (conversation.lastMessage) {
    const isOwn = conversation.lastMessage.senderId === CURRENT_USER_ID;
    previewText = isOwn
      ? `You: ${conversation.lastMessage.text}`
      : conversation.lastMessage.text;
  }

  const unreadLabel =
    conversation.unreadCount === 1
      ? "1 unread message"
      : `${conversation.unreadCount} unread messages`;

  return (
    <Link
      href={Routes.chat(conversation.id)}
      aria-current={isCurrentChat ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
        isCurrentChat && "bg-muted/90",
      )}
    >
      <Avatar size="default" className="relative shrink-0">
        <AvatarImage src={conversation.avatarUrl} alt={conversation.name} />
        <AvatarFallback>{getInitials(conversation.name)}</AvatarFallback>
        {conversation.type === "direct" && conversation.isOnline && (
          <AvatarBadge
            className="bg-emerald-500 ring-background"
            aria-label="Online"
            title="Online"
          />
        )}
      </Avatar>

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center justify-between gap-1">
          <div className="flex min-w-0 items-center gap-1.5">
            {conversation.type === "group" && (
              <Users
                className="size-3.5 shrink-0 text-muted-foreground"
                aria-hidden="true"
                data-testid="group-icon"
              />
            )}
            <span className="truncate text-sm font-medium text-foreground">
              {conversation.name}
            </span>
          </div>
          {conversation.lastMessage && (
            <time
              dateTime={conversation.lastMessage.createdAt}
              className="shrink-0 text-xs text-muted-foreground"
            >
              {formatLastMessageTime(conversation.lastMessage.createdAt)}
            </time>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className="min-h-4.5 truncate text-xs text-muted-foreground">
            {previewText}
          </p>
          {conversation.unreadCount > 0 && (
            <Badge
              variant="default"
              className="h-4.5 min-w-4.5 rounded-full px-1.5 text-xs font-semibold"
              aria-label={unreadLabel}
            >
              {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </Link>
  );
}
