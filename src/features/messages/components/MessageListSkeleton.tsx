import { cn } from "@/lib/utils";
import { Skeleton } from "@/ui/primitives/skeleton";

const BUBBLES = [
  { isOwn: false, width: "w-56" },
  { isOwn: true, width: "w-64" },
  { isOwn: false, width: "w-44" },
  { isOwn: false, width: "w-72" },
  { isOwn: true, width: "w-48" },
  { isOwn: true, width: "w-60" },
  { isOwn: false, width: "w-52" },
];

// same container and row padding as MessageList, so content replaces it in place
export function MessageListSkeleton() {
  return (
    <div
      aria-busy="true"
      className="flex min-h-0 flex-1 flex-col justify-end overflow-hidden bg-muted/40 px-2 pt-4 pb-14 md:px-12"
    >
      <span className="sr-only">Loading messages...</span>
      {BUBBLES.map(({ isOwn, width }, index) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed placeholders never reorder
          key={index}
          className={cn(
            "flex w-full gap-2 px-3 py-1",
            isOwn ? "justify-end" : "justify-start",
          )}
        >
          {!isOwn && <Skeleton className="size-7 shrink-0 rounded-full" />}
          <Skeleton
            className={cn(
              "h-14 max-w-4/5 rounded-2xl",
              isOwn ? "rounded-br-xs" : "rounded-bl-xs",
              width,
            )}
          />
        </div>
      ))}
    </div>
  );
}

// used before the conversation itself is known
export function ChatPanelSkeleton() {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <MessageListSkeleton />
      <div className="flex items-end gap-2 border-t bg-background px-4 py-2">
        <Skeleton className="size-9 shrink-0 rounded-md" />
        <Skeleton className="h-10 flex-1 rounded-lg" />
        <Skeleton className="size-9 shrink-0 rounded-md" />
      </div>
    </div>
  );
}
