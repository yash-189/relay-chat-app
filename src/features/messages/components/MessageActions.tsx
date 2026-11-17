import { Copy, Edit2, Reply, Smile, Trash2 } from "lucide-react";
import { useState } from "react";
import { useCopyToClipboard } from "../hooks/useCopyToClipboard";
import { ReactionBar } from "./ReactionBar";

interface MessageActionsProps {
  text: string;
  isOwn: boolean;
  onReply: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onReact: (emoji: string) => void;
}

export function MessageActions({
  text,
  isOwn,
  onReply,
  onEdit,
  onDelete,
  onReact,
}: MessageActionsProps) {
  const [showReactions, setShowReactions] = useState(false);
  const { copy } = useCopyToClipboard();

  return (
    <div className="relative inline-flex items-center">
      {showReactions && (
        <div className="absolute -top-10 right-0 z-10">
          <ReactionBar
            onSelect={(emoji) => {
              onReact(emoji);
              setShowReactions(false);
            }}
          />
        </div>
      )}
      <div className="inline-flex items-center gap-0.5 rounded-md border bg-background/90 p-0.5 shadow-xs backdrop-blur-xs">
        <button
          type="button"
          onClick={() => setShowReactions((prev) => !prev)}
          className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Add reaction"
        >
          <Smile className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={onReply}
          className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Reply"
        >
          <Reply className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={() => copy(text)}
          className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Copy message text"
        >
          <Copy className="size-3.5" />
        </button>
        {isOwn && onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Edit message"
          >
            <Edit2 className="size-3.5" />
          </button>
        )}
        {isOwn && onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="rounded p-1 text-destructive hover:bg-destructive/10"
            aria-label="Delete message"
          >
            <Trash2 className="size-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
