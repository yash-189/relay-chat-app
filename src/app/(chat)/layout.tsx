import { Suspense } from "react";
import {
  ConversationList,
  ConversationListSkeleton,
} from "@/features/conversations";
import { site } from "@/lib/site";
import { ChatShell } from "@/ui/components/layout/ChatShell";
import { ThemeToggle } from "@/ui/components/theme/ThemeToggle";

export default function ChatLayout({ children }: LayoutProps<"/">) {
  return (
    <ChatShell
      sidebar={
        <>
          <header className="flex h-14 shrink-0 items-center justify-between border-b px-4">
            <span className="font-semibold">{site.name}</span>
            <ThemeToggle />
          </header>
          <Suspense fallback={<ConversationListSkeleton />}>
            <ConversationList />
          </Suspense>
        </>
      }
    >
      {children}
    </ChatShell>
  );
}
