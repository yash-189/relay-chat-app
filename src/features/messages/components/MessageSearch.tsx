import { ChevronDown, ChevronUp, Search, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "@/ui/primitives/button";

interface MessageSearchProps {
  query: string;
  onQueryChange: (query: string) => void;
  matchCount: number;
  currentMatchIndex: number;
  onNavigate: (direction: "up" | "down") => void;
  onClose: () => void;
}

export function MessageSearch({
  query,
  onQueryChange,
  matchCount,
  currentMatchIndex,
  onNavigate,
  onClose,
}: MessageSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "Enter") {
      e.preventDefault();
      onNavigate(e.shiftKey ? "up" : "down");
    }
  };

  return (
    <div className="flex h-12 w-full items-center gap-2 border-b bg-background/95 px-4 backdrop-blur-xs">
      <Search className="size-4 shrink-0 text-muted-foreground" />
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search in conversation…"
        className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        aria-label="Search messages"
      />
      {query.trim().length > 0 && (
        <span className="select-none text-muted-foreground text-xs">
          {matchCount > 0
            ? `${currentMatchIndex + 1} of ${matchCount}`
            : "No matches"}
        </span>
      )}
      <div className="flex items-center gap-0.5">
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          disabled={matchCount === 0}
          onClick={() => onNavigate("up")}
          aria-label="Previous match"
        >
          <ChevronUp className="size-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          disabled={matchCount === 0}
          onClick={() => onNavigate("down")}
          aria-label="Next match"
        >
          <ChevronDown className="size-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={onClose}
          aria-label="Close search"
        >
          <X className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
