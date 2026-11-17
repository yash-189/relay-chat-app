import { CenteredState } from "@/ui/components/feedback/CenteredState";
import { EmptyState } from "@/ui/components/feedback/EmptyState";

export default function HomePage() {
  return (
    <CenteredState>
      <EmptyState
        title="No conversation selected"
        description="Pick a conversation from the list to start chatting."
      />
    </CenteredState>
  );
}
