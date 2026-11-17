import { X } from "lucide-react";

interface ReplyPreviewProps {
  senderName?: string;
  text: string;
  onCancel?: () => void;
  onClick?: () => void;
}

export function ReplyPreview({
  senderName,
  text,
  onCancel,
  onClick,
}: ReplyPreviewProps) {
  const content = (
    <div className="min-w-0 flex-1 text-left">
      {senderName && (
        <p className="truncate font-semibold text-primary">{senderName}</p>
      )}
      <p className="truncate text-muted-foreground">{text}</p>
    </div>
  );

  return (
    <div className="flex items-center justify-between gap-2 rounded-md border-primary border-l-2 bg-muted/60 px-3 py-1.5 text-xs">
      {onClick ? (
        <button
          type="button"
          onClick={onClick}
          className="flex min-w-0 flex-1 items-center hover:opacity-80"
          aria-label={
            senderName
              ? `Jump to original message by ${senderName}`
              : "Jump to original message"
          }
        >
          {content}
        </button>
      ) : (
        content
      )}
      {onCancel && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onCancel();
          }}
          className="shrink-0 rounded p-0.5 text-muted-foreground hover:bg-background hover:text-foreground"
          aria-label="Cancel reply"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}
