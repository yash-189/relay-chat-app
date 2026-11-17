import { cn } from "@/lib/utils";

interface ReactionBarProps {
  onSelect: (emoji: string) => void;
  className?: string;
}

const EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥"] as const;

export function ReactionBar({ onSelect, className }: ReactionBarProps) {
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
          className="flex size-7 items-center justify-center rounded-full text-sm transition-transform hover:scale-125 hover:bg-muted active:scale-95"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
