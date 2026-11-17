"use client";

import { Search } from "lucide-react";
import { useChatStore } from "@/store/chat.store";
import { Button } from "@/ui/primitives/button";

export function MessageSearchToggle() {
  const toggleSearch = useChatStore((s) => s.toggleSearch);
  const isSearchOpen = useChatStore((s) => s.isSearchOpen);

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={toggleSearch}
      aria-label={isSearchOpen ? "Close message search" : "Search messages"}
      aria-pressed={isSearchOpen}
    >
      <Search className="size-4" />
    </Button>
  );
}
