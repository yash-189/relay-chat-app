import { EmptyState } from "@/ui/components/feedback/EmptyState";

export default function HomePage() {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <EmptyState
        title="No conversation selected"
        description="Pick a conversation from the list to start chatting."
      />
    </div>
  );
}
