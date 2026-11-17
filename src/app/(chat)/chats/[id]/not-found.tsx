import Link from "next/link";
import { Routes } from "@/lib/routes";
import { CenteredState } from "@/ui/components/feedback/CenteredState";
import { EmptyState } from "@/ui/components/feedback/EmptyState";
import { buttonVariants } from "@/ui/primitives/button";

export default function ChatNotFound() {
  return (
    <CenteredState>
      <EmptyState
        title="Conversation not found"
        description="It may have been removed, or the link is wrong."
        action={
          <Link href={Routes.home} className={buttonVariants({ size: "sm" })}>
            Back to chats
          </Link>
        }
      />
    </CenteredState>
  );
}
