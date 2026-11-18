import { cn } from "@/lib/utils";
import { MessageSenderAvatar } from "./MessageSenderAvatar";

const DOT_DELAYS = ["[animation-delay:-0.3s]", "[animation-delay:-0.15s]", ""];

interface TypingBubbleProps {
  label: string;
  name?: string;
  avatarUrl?: string | null;
}

export function TypingBubble({ label, name, avatarUrl }: TypingBubbleProps) {
  return (
    <output
      aria-label={label}
      className="fade-in slide-in-from-bottom-1 flex animate-in items-end gap-2 duration-200"
    >
      <MessageSenderAvatar name={name} avatarUrl={avatarUrl} />
      <span className="inline-flex items-center gap-1 rounded-2xl rounded-bl-xs bg-muted px-3.5 py-3 shadow-xs">
        {DOT_DELAYS.map((delay) => (
          <span
            key={delay || "last"}
            className={cn(
              "size-1.5 animate-bounce rounded-full bg-muted-foreground",
              delay,
            )}
          />
        ))}
      </span>
    </output>
  );
}
