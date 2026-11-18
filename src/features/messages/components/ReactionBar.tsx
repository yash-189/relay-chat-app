import { cn } from "@/lib/utils";

interface ReactionBarProps {
  onSelect: (emoji: string) => void;
  selectedEmoji?: string | null;
  className?: string;
}

const EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥"] as const;

export function ReactionBar({
  onSelect,
  selectedEmoji,
  className,
}: ReactionBarProps) {
  return (
    <div
      role="toolbar"
      aria-label="Reactions"
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border bg-background/95 p-1 shadow-xs backdrop-blur-xs",
        className,
      )}
    >
      {EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => onSelect(emoji)}
          aria-label={`React with ${emoji}`}
          aria-pressed={emoji === selectedEmoji}
          className={cn(
            "flex size-7 items-center justify-center rounded-full text-sm transition-transform hover:scale-125 hover:bg-muted active:scale-95",
            emoji === selectedEmoji && "bg-primary/15 ring-1 ring-primary",
          )}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
