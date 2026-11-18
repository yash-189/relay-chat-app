import { Suspense } from "react";
import {
  ConversationList,
  ConversationListSkeleton,
} from "@/features/conversations";
import { Logo } from "@/ui/components/brand/Logo";
import { ChatShell } from "@/ui/components/layout/ChatShell";
import { ThemeToggle } from "@/ui/components/theme/ThemeToggle";

export default function ChatLayout({ children }: LayoutProps<"/">) {
  return (
    <ChatShell
      sidebar={
        <>
          <header className="flex h-14 shrink-0 items-center justify-between border-b px-4">
            <Logo />
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
