import { Skeleton } from "@/ui/primitives/skeleton";

export function MessageListSkeleton() {
  return (
    <div className="flex flex-1 flex-col justify-end gap-3 p-4">
      <Skeleton className="h-10 w-48 self-start rounded-2xl" />
      <Skeleton className="h-14 w-64 self-end rounded-2xl" />
      <Skeleton className="h-10 w-52 self-start rounded-2xl" />
      <Skeleton className="h-12 w-40 self-end rounded-2xl" />
    </div>
  );
}
