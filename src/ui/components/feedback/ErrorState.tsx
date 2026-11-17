import { Button } from "@/ui/primitives/button";

interface ErrorStateProps {
  title: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({ title, description, onRetry }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-2 rounded-lg border border-destructive/30 p-8 text-center"
    >
      <p className="font-medium">{title}</p>
      {description && (
        <p className="text-muted-foreground text-sm">{description}</p>
      )}
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
