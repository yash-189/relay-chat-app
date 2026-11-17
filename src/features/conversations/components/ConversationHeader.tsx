"use client";

import { ArrowLeft, Users } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useTypingLabel } from "@/features/messages";
import { Routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/primitives/avatar";
import { Skeleton } from "@/ui/primitives/skeleton";
import type { Conversation } from "../types";
import { getInitials } from "../utils";

const HEADER_CLASS =
  "flex h-14 shrink-0 items-center justify-between gap-2 border-b bg-background px-4";

interface ConversationHeaderProps {
  conversation: Conversation;
  actions?: ReactNode;
}

function getHeaderStatus(
  conversation: Conversation,
  typingLabel: string | null,
) {
  if (typingLabel) return typingLabel;
  if (conversation.type === "group") {
    return `${conversation.participantIds.length} members`;
  }
  return conversation.isOnline ? "Online" : "Offline";
}

export function ConversationHeaderSkeleton() {
  return (
    <header className={HEADER_CLASS}>
      <div className="flex items-center gap-3">
        <Skeleton className="size-9 rounded-full" />
        <div className="flex flex-col gap-1">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </header>
  );
}

export function ConversationHeader({
  conversation,
  actions,
}: ConversationHeaderProps) {
  const typingLabel = useTypingLabel(conversation.id);
  const isGroup = conversation.type === "group";

  return (
    <header className={HEADER_CLASS}>
      <div className="flex min-w-0 items-center gap-3">
        <Link
          href={Routes.home}
          className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground md:hidden"
          aria-label="Back to conversations"
        >
          <ArrowLeft className="size-4" />
        </Link>

        <div className="relative">
          <Avatar className="size-9 select-none">
            <AvatarImage src={conversation.avatarUrl} alt={conversation.name} />
            <AvatarFallback>{getInitials(conversation.name)}</AvatarFallback>
          </Avatar>
          {!isGroup && conversation.isOnline && (
            <span
              className="absolute right-0 bottom-0 size-2.5 rounded-full bg-online ring-2 ring-background"
              aria-hidden="true"
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h1 className="truncate font-semibold text-sm">
              {conversation.name}
            </h1>
            {isGroup && (
              <Users
                className="size-3.5 shrink-0 text-muted-foreground"
                aria-label="Group chat"
              />
            )}
          </div>
          <p
            aria-live="polite"
            className={cn(
              "truncate text-xs",
              typingLabel
                ? "font-medium text-primary"
                : "text-muted-foreground",
            )}
          >
            {getHeaderStatus(conversation, typingLabel)}
          </p>
        </div>
      </div>

      {actions && <div className="flex items-center gap-1">{actions}</div>}
    </header>
  );
}
