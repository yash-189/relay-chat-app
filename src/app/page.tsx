import { EmptyState } from "@/ui/components/feedback/EmptyState";

export default function HomePage() {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <EmptyState title="No conversation selected" />
    </main>
  );
}
