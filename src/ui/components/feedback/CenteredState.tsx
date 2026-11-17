import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CenteredStateProps {
  children: ReactNode;
  className?: string;
}

export function CenteredState({ children, className }: CenteredStateProps) {
  return (
    <div
      className={cn("flex flex-1 items-center justify-center p-6", className)}
    >
      {children}
    </div>
  );
}
