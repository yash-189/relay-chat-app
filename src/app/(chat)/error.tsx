"use client";

import { ErrorState } from "@/ui/components/feedback/ErrorState";

export default function ChatError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <ErrorState
        title="Something went wrong"
        description={
          error.digest
            ? `Please try again. Reference: ${error.digest}`
            : "Please try again."
        }
        onRetry={retry}
      />
    </div>
  );
}
