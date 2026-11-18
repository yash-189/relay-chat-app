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
          "w-full flex-col border-r bg-sidebar md:flex md:w-2/5 md:max-w-md lg:w-1/3",
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
