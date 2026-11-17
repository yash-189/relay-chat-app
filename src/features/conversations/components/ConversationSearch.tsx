"use client";

import { Search, X } from "lucide-react";
import { Button } from "@/ui/primitives/button";
import { Input } from "@/ui/primitives/input";

interface ConversationSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function ConversationSearch({
  value,
  onChange,
}: ConversationSearchProps) {
  return (
    <div className="relative flex items-center">
      <Search
        className="pointer-events-none absolute left-2.5 size-4 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        id="conversation-search"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search conversations..."
        aria-label="Search conversations"
        className="h-9 pl-8 pr-8 text-sm"
      />
      {value.length > 0 && (
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={() => onChange("")}
          className="absolute right-1 size-7 p-0 text-muted-foreground hover:text-foreground"
          aria-label="Clear search"
        >
          <X className="size-3.5" aria-hidden="true" />
        </Button>
      )}
    </div>
  );
}
