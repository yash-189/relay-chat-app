import type { LucideIcon } from "lucide-react";
import { AlertCircle, Check, CheckCheck, Clock, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/primitives/avatar";
import { CURRENT_USER_ID } from "../api";
import { DELETED_MESSAGE_LABEL, MessageStatusLabels } from "../constants";
import type { Message, MessageStatus } from "../types";
import { findUserReaction, formatMessageTime } from "../utils";
import { MessageActions } from "./MessageActions";
import { MessageAttachment } from "./MessageAttachment";
import { ReplyPreview } from "./ReplyPreview";

const EDITED_LABEL = "edited";

const StatusIcons = {
  sending: { Icon: Clock, className: "size-3" },
  sent: { Icon: Check, className: "size-3" },
  delivered: { Icon: CheckCheck, className: "size-3.5" },
  read: { Icon: CheckCheck, className: "size-3.5 text-read" },
  failed: { Icon: AlertCircle, className: "size-3 text-destructive" },
} satisfies Record<MessageStatus, { Icon: LucideIcon; className: string }>;

function StatusIndicator({
  status,
  onRetry,
}: {
  status?: Message["status"];
  onRetry?: () => void;
}) {
  if (!status) return null;

  const { Icon, className } = StatusIcons[status];
  const label = MessageStatusLabels[status];

  if (status === "failed") {
    return (
      <div className="inline-flex items-center gap-1 text-destructive">
        <Icon className={className} aria-label={label} />
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-0.5 font-medium text-xs underline underline-offset-2 hover:opacity-80"
          >
            <RotateCcw className="size-2.5" />
            Retry
          </button>
        )}
      </div>
    );
  }

  return <Icon className={className} aria-label={label} />;
}

function MessageReactions({
  reactions,
  onToggleReaction,
}: {
  reactions?: Message["reactions"];
  onToggleReaction: (emoji: string) => void;
}) {
  if (!reactions?.length) return null;

  return (
    <div className="relative z-10 -mt-2 flex flex-wrap gap-1 px-2">
      {reactions.map((r) => {
        const hasReacted = r.userIds.includes(CURRENT_USER_ID);
        return (
          <button
            key={r.emoji}
            type="button"
            onClick={() => onToggleReaction(r.emoji)}
            aria-label={`${r.emoji} ${r.userIds.length}`}
            className={cn(
              "fade-in zoom-in-75 inline-flex animate-in items-center gap-1 rounded-full border px-1.5 py-0.5 text-xs shadow-xs transition-colors duration-150",
              hasReacted
                ? "border-primary bg-card text-primary"
                : "border-border bg-card hover:bg-muted",
            )}
          >
            <span>{r.emoji}</span>
            <span className="font-medium text-xs">{r.userIds.length}</span>
          </button>
        );
      })}
    </div>
  );
}

function MessageReplySection({
  replyMessage,
  replySenderName,
  onScrollToMessage,
}: {
  replyMessage: Message;
  replySenderName?: string;
  onScrollToMessage?: (id: string) => void;
}) {
  const text = replyMessage.deletedAt
    ? DELETED_MESSAGE_LABEL
    : replyMessage.text;
  const handleClick = onScrollToMessage
    ? () => onScrollToMessage(replyMessage.id)
    : undefined;

  return (
    <div className="mb-1.5">
      <ReplyPreview
        senderName={replySenderName}
        text={text}
        onClick={handleClick}
      />
    </div>
  );
}

function MessageSenderAvatar({
  name,
  avatarUrl,
}: {
  name?: string;
  avatarUrl?: string | null;
}) {
  const fallback = name ? name.slice(0, 2).toUpperCase() : "?";

  return (
    <Avatar className="size-7 shrink-0 select-none">
      {avatarUrl && <AvatarImage src={avatarUrl} alt={name ?? "User"} />}
      <AvatarFallback className="text-xs">{fallback}</AvatarFallback>
    </Avatar>
  );
}

function MessageFooter({
  time,
  createdAt,
  isOwn,
  isEdited,
  status,
  onRetry,
}: {
  time: string;
  createdAt: string;
  isOwn: boolean;
  isEdited: boolean;
  status?: Message["status"];
  onRetry?: () => void;
}) {
  return (
    <div
      className={cn(
        "mt-1 flex items-center justify-end gap-1 text-xs",
        isOwn ? "text-primary-foreground/75" : "text-muted-foreground",
      )}
    >
      {isEdited && <span>{EDITED_LABEL}</span>}
      <time dateTime={createdAt}>{time}</time>
      {isOwn && <StatusIndicator status={status} onRetry={onRetry} />}
    </div>
  );
}

function MessageContent({
  message,
  isOwn,
}: {
  message: Message;
  isOwn: boolean;
}) {
  if (message.deletedAt) {
    return (
      <p className="text-[0.9375rem] text-muted-foreground italic">
        {DELETED_MESSAGE_LABEL}
      </p>
    );
  }

  return (
    <>
      {message.attachment && (
        <MessageAttachment attachment={message.attachment} isOwn={isOwn} />
      )}
      {message.text && (
        <p className="whitespace-pre-wrap break-words text-[0.9375rem] leading-snug selection:bg-background/20">
          {message.text}
        </p>
      )}
    </>
  );
}

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  senderName?: string;
  senderAvatarUrl?: string | null;
  showSenderHeader?: boolean;
  replyMessage?: Message | null;
  replySenderName?: string;
  onReply: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleReaction: (emoji: string) => void;
  onScrollToMessage?: (id: string) => void;
  onRetrySend?: () => void;
  isHighlighted?: boolean;
}

export function MessageBubble({
  message,
  isOwn,
  senderName,
  senderAvatarUrl,
  showSenderHeader = false,
  replyMessage,
  replySenderName,
  onReply,
  onEdit,
  onDelete,
  onToggleReaction,
  onScrollToMessage,
  onRetrySend,
  isHighlighted = false,
}: MessageBubbleProps) {
  const isDeleted = Boolean(message.deletedAt);
  const isEdited = Boolean(message.editedAt) && !isDeleted;
  const time = formatMessageTime(message.createdAt);
  return (
    <div
      data-message-id={message.id}
      className={cn(
        "group relative flex w-full gap-2 px-3 py-1",
        isOwn ? "justify-end" : "justify-start",
        isHighlighted && "rounded-md bg-accent/40",
      )}
    >
      {!isOwn && (
        <MessageSenderAvatar name={senderName} avatarUrl={senderAvatarUrl} />
      )}

      <div
        className={cn(
          "relative flex max-w-4/5 flex-col lg:max-w-3/5",
          isOwn ? "items-end" : "items-start",
        )}
      >
        {!isDeleted && (
          <div
            className={cn(
              "absolute -top-3 z-10 hidden transition-opacity group-focus-within:flex group-hover:flex",
              isOwn ? "right-2" : "left-2",
            )}
          >
            <MessageActions
              text={message.text}
              isOwn={isOwn}
              onReply={onReply}
              onEdit={isOwn ? onEdit : undefined}
              onDelete={isOwn ? onDelete : undefined}
              onReact={onToggleReaction}
              selectedEmoji={findUserReaction(
                message.reactions,
                CURRENT_USER_ID,
              )}
            />
          </div>
        )}

        <div
          className={cn(
            "relative rounded-2xl px-3.5 py-2 shadow-xs transition-colors",
            isOwn
              ? "rounded-br-xs bg-primary text-primary-foreground"
              : "rounded-bl-xs bg-muted text-foreground",
            isHighlighted && "ring-2 ring-primary ring-offset-1",
          )}
        >
          {showSenderHeader && senderName && !isOwn && (
            <p className="mb-0.5 font-semibold text-primary text-xs">
              {senderName}
            </p>
          )}

          {replyMessage && !isDeleted && (
            <MessageReplySection
              replyMessage={replyMessage}
              replySenderName={replySenderName}
              onScrollToMessage={onScrollToMessage}
            />
          )}

          <MessageContent message={message} isOwn={isOwn} />

          <MessageFooter
            time={time}
            createdAt={message.createdAt}
            isOwn={isOwn}
            isEdited={isEdited}
            status={message.status}
            onRetry={onRetrySend}
          />
        </div>

        <MessageReactions
          reactions={message.reactions}
          onToggleReaction={onToggleReaction}
        />
      </div>
    </div>
  );
}
