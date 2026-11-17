"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ChatShellProps {
  sidebar: ReactNode;
  children: ReactNode;
}

// On small screens only one pane fits, so an open chat hides the sidebar.
export function ChatShell({ sidebar, children }: ChatShellProps) {
  const isChatOpen = useSelectedLayoutSegment() !== null;

  return (
    <div className="flex h-dvh overflow-hidden">
      <aside
        className={cn(
          "w-full flex-col border-r md:flex md:w-80 lg:w-96",
          isChatOpen ? "hidden" : "flex",
        )}
      >
        {sidebar}
      </aside>
      <main
        className={cn(
          "min-w-0 flex-1 flex-col md:flex",
          isChatOpen ? "flex" : "hidden",
        )}
      >
        {children}
      </main>
    </div>
  );
}
